const { unpack, keyRing } = require('ara-network/keys')
const { createChannel } = require('ara-network/discovery/channel')
const isDomainName = require('is-domain-name')
const isBrowser = require('is-browser')
const isBuffer = require('is-buffer')
const { DID } = require('did-uri')
const debug = require('debug')('ara:identity:resolve')
const fetch = require('node-fetch')
const pify = require('pify')
const dns = require('ara-identity-dns')
const url = require('url')
const fs = require('./fs')
const rc = require('./rc')()

const DID_IDENTIFIER_LENGTH = 64
const DID_METHOD = 'ara'
const RESOLUTION_TIMEOUT = 5000
const MAX_PEER_RESOLVERS = 8

function notFound() {
  return Object.assign(
    new Error('Could not resolve DID. No peer found'),
    { status: 404, code: 'ENOTFOUND' }
  )
}

async function resolve(uri, opts = {}) {
  if ('object' !== typeof opts) {
    throw new TypeError('Expecting options to be an object.')
  }

  let conf
  try { conf = rc.network.identity.resolver } finally { conf = conf || {} }
  opts.secret = opts.secret || conf.secret
  opts.keyring = opts.keyring || conf.keyring
  opts.network = opts.network || conf.network
  opts.servers = opts.servers || conf.servers

  // is DID ?
  if (uri && 'object' === typeof uri && uri.did) {
    if ('string' === typeof uri.did) {
      uri = uri.did
    } else if ('object' === typeof uri.did) {
      uri = uri.did.reference
    }
  } else if ('string' === typeof uri && isDomainName(uri)) {
    try {
      const resolution = await dns.resolve(uri)
      if (resolution && resolution.length) {
        if (resolution[0] && resolution[0].identifier) {
          uri = resolution[0].identifier
        }
      }
    } catch (err) {
      debug(err)
    }
  }

  if (0 !== uri.indexOf('did:ara:')) {
    // eslint-disable-next-line no-param-reassign
    uri = `did:ara:${uri}`
  }

  const did = new DID(uri)

  if (DID_METHOD !== did.method) {
    throw new TypeError(`Invalid DID method (${did.method}). ` +
      `Expecting 'did:${DID_METHOD}:...'.`)
  }

  if (did.identifier && -1 !== did.identifier.indexOf('.')) {
    throw new TypeError(`Unable to resolve DID for domain: ${did.identifier}`)
  }

  if (!did.identifier || DID_IDENTIFIER_LENGTH !== did.identifier.length) {
    throw new TypeError('Invalid DID identifier length.')
  }

  const state = { aborted: false }
  const resolutions = []

  resolutions.push(async () => {
    if (isBrowser) { return null }
    try {
      const ddo = await fs.readFile(did.identifier, 'ddo.json', opts)
      return JSON.parse(String(ddo))
    } catch (err) {
      debug(err)
    }

    return null
  })

  resolutions.push(async () => {
    if (!opts || !opts.secret || !opts.keyring || !opts.network) {
      return null
    }

    if ('string' !== typeof opts.secret && !isBuffer(opts.secret)) {
      return new TypeError('Expecting shared secret to be a string or buffer.')
    }

    if (!opts.secret || 0 === opts.secret.length) {
      return new TypeError('Shared secret cannot be empty.')
    }

    if (!opts.keyring) {
      return new TypeError('Expecting network keys keyring.')
    }

    if (!opts.network || 'string' !== typeof opts.network) {
      throw new TypeError('Expecting network name for the resolver.')
    }

    if (null === opts.timeout || 'number' !== typeof opts.timeout) {
      // eslint-disable-next-line no-param-reassign
      opts.timeout = RESOLUTION_TIMEOUT
    }

    return findResolution(did, opts, state)
  })

  return pify(async (done) => {
    let resolved = false
    let pending = 0
    const queue = false === opts.cache ? resolutions.reverse() : resolutions

    for (let i = 0; i < queue.length; ++i) {
      const resolution = queue[i]

      if (resolved || state.aborted) {
        break
      } else {
        pending++
        resolution().then(onthen).catch(onerror)
      }
    }

    function onerror(err) {
      state.aborted = true
      done(err)
    }

    function onthen(result) {
      pending--
      if (result) {
        resolved = true
        state.aborted = true
        try {
          done(null, result)
          return
        } catch (err) {
          debug(err)
        }
      }

      if (0 === pending) {
        state.aborted = true
        done(notFound())
      }
    }
  })()
}

async function findResolution(did, opts, state) {
  const resolvers = []
  const secret = Buffer.from(opts.secret)
  const keyring = keyRing(opts.keyring, { secret })
  await keyring.ready()
  const buffer = await keyring.get(opts.network)
  const unpacked = unpack({ buffer })
  const { discoveryKey } = unpacked
  keyring.storage.close()

  const channel = createChannel()
  let didResolve = false
  let timeout = null
  let result = null

  if (opts.servers && opts.servers.length) {
    for (const server of opts.servers) {
      const uri = url.parse(server)
      const { protocol, host } = uri
      let { port } = uri

      if (!port) {
        if ('https:' === protocol) {
          port = 443
        } else {
          port = 80
        }
      }

      resolvers.push({
        id: null,
        peer: { host, port },
        type: protocol.replace(':', ''),
      })
    }
  }

  return pify((done) => {
    channel.on('peer', onpeer)
    channel.join(discoveryKey)

    if (resolvers.length) {
      process.nextTick(doResolution)
    } else {
      timeout = setTimeout(doResolution, opts.timeout)
    }

    function onpeer(id, peer, type) {
      if (state.aborted) {
        cleanup()
      } else if (resolvers.length < MAX_PEER_RESOLVERS) {
        resolvers.push({ id, peer, type })
        if (1 === resolvers.length) {
          process.nextTick(doResolution)
        }
      }
    }

    async function doResolution() {
      clearTimeout(timeout)

      if (state.aborted) {
        cleanup()
        done()
        return
      }

      if (!didResolve && 0 === resolvers.length && !state.aborted) {
        cleanup()
        done(null, result)
      } else if (!state.aborted && !didResolve) {
        const { peer, type } = resolvers.shift()
        const { host, port } = peer
        let uri = ''

        if ('https' === type || 'http' === type) {
          uri = `${type}://${host}`
        } else {
          uri = `http://${host}:${port}`
        }

        uri += `/1.0/identifiers/${did.did}`
        timeout = setTimeout(doResolution, opts.timeout)

        try {
          const res = await fetch(uri, { mode: 'cors' })
          const json = await res.json()
          result = json.didDocument

          didResolve = true
          cleanup()
          done(null, result)
        } catch (err) {
          doResolution()
          debug(err)
        }
      }
    }

    function cleanup() {
      clearTimeout(timeout)
      channel.removeListener('peer', onpeer)
      channel.destroy()

      if (!didResolve && !state.aborted) {
        done(notFound())
      }
    }
  })()
}

module.exports = {
  resolve
}
