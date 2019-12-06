const { resolveDNS, writeCache } = require('./util')
const { unpack, keyRing } = require('ara-network/keys')
const { readFile, stat } = require('fs')
const { createChannel } = require('ara-network/discovery/channel')
const isDomainName = require('is-domain-name')
const isBrowser = require('is-browser')
const isBuffer = require('is-buffer')
const { DID } = require('did-uri')
const debug = require('debug')('ara:identity:resolve')
const fetch = require('node-fetch')
const path = require('path')
const pify = require('pify')
const url = require('url')
const fs = require('./fs')
const os = require('os')
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
  try {
    conf = {
      secret:
        rc.network.identity.resolver.secret || rc.network.identity.secret,

      keyring:
        rc.network.identity.resolver.keyring || rc.network.identity.keyring,

      network:
        rc.network.identity.resolver.network,

      servers:
        rc.network.identity.resolver.servers
    }
  } finally {
    conf = conf || {}
  }
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
      uri = await resolveDNS(uri, rc.network.dns)
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
      return (opts.parse || JSON.parse)(String(ddo))
    } catch (err) {
      debug(err)
    }

    return null
  })

  resolutions.push(async () => {
    if (isBrowser || !opts.cache) { return null }
    try {
      const cachePath = path.join(os.tmpdir(), 'aid', did.identifier, 'ddo.json')
      const stats = await pify(stat)(cachePath)
      const ttl = 1000 * 30
      const now = Date.now()

      if ((now - stats.ctime) / ttl < 1) {
        const json = await pify(readFile)(cachePath, 'utf8')
        return (opts.parse || JSON.parse)(String(json))
      }
    } catch (err) {
      debug(err)
    }

    return null
  })

  resolutions.push(async () => {
    if (!opts) {
      return null
    }

    if (!opts.servers && (!opts.secret || !opts.keyring || !opts.network)) {
      return null
    }

    if (opts.secret && 'string' !== typeof opts.secret && !isBuffer(opts.secret)) {
      return new TypeError('Expecting shared secret to be a string or buffer.')
    }

    if (opts.secret && 0 === opts.secret.length) {
      return new TypeError('Shared secret cannot be empty.')
    }

    if (opts.network && 'string' !== typeof opts.network) {
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
        process.nextTick(() => resolution().then(onthen).catch(onerror))
      }
    }

    function onerror(err) {
      state.aborted = true
      done(err)
    }

    async function onthen(result) {
      pending--
      if (result) {
        resolved = true
        state.aborted = true
        process.nextTick(done, null, result)
      }

      if (!resolved && 0 === pending) {
        state.aborted = true
        done(notFound())
      }
    }
  })()
}

const keyrings = {}

async function findResolution(did, opts, state) {
  return pify((done) => {
    const resolvers = []

    let discoveryKey = null
    let didResolve = false
    let pending = 0
    let channel = null
    let timeout = null
    let keyring = null
    let result = null

    if (!isBrowser && opts.secret && opts.keyring && opts.network) {
      const secret = Buffer.from(opts.secret)
      keyring = keyrings[opts.keyrings] || keyRing(opts.keyring, { secret })
      keyrings[opts.keyring] = keyring
      keyring.get(opts.network, (err, buffer) => {
        if (err) {
          debug(err)
        } else {
          const unpacked = unpack({ buffer })
          // eslint-disable-next-line prefer-destructuring
          discoveryKey = unpacked.discoveryKey
          channel = createChannel()
          channel.on('peer', onpeer)
          channel.join(discoveryKey)
        }
      })
    }

    if (opts.servers && opts.servers.length) {
      for (const server of opts.servers) {
        const uri = url.parse(server)
        const { host } = uri
        let { port } = uri
        // eslint-disable-next-line no-undef
        const { protocol = isBrowser ? window.location.protocol : 'http:' } = uri

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
          type: protocol ? protocol.replace(':', '') : isBrowser,
        })
      }
    }
    for (let i = 0; i < resolvers.length; ++i) {
      process.nextTick(doResolution)
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
        process.nextTick(cleanup)
        process.nextTick(done)
        return
      }

      if (0 === pending && !didResolve && 0 === resolvers.length && !state.aborted) {
        // Revert to expired cache copy if present
        if (false === isBrowser) {
          try {
            const cachePath = path.join(os.tmpdir(), 'aid', did.identifier, 'ddo.json')
            const json = await pify(readFile)(cachePath, 'utf8')
            done(null, (opts.parse || JSON.parse)(String(json)))
          } catch (err) {
            debug(err)
          }
        }

        cleanup()
        done(null, result)
      } else if (resolvers.length && !state.aborted && !didResolve) {
        for (const { peer, type } of resolvers) {
          resolvers.shift()
          const { host, port } = peer
          let uri = ''

          if ('https' === type || 'http' === type) {
            uri = `${type}://${host}`
          } else {
            uri = `http://${host}:${port}`
          }

          uri += `/1.0/identifiers/${did.did}`
          timeout = setTimeout(doResolution, opts.timeout)

          /* eslint-disable no-loop-func */
          pending++
          fetch(uri, { mode: 'cors' })
            .then(async (res) => {
              const json = await res.json()
              result = json.didDocument

              // Write DDO to temp cache folder
              if (false === isBrowser && result) {
                await writeCache(did.identifier, 'ddo.json', JSON.stringify(result))
              }
              didResolve = true
              cleanup()
              pending--
              done(null, result)
            })
            .catch((err) => {
              debug(err)
              if (0 === --pending) {
                process.nextTick(doResolution)
              }
            })
          /* eslint-enable no-loop-func */
        }
      }
    }

    function cleanup() {
      if (channel) {
        clearTimeout(timeout)
        channel.removeListener('peer', onpeer)
        channel.destroy()
      }

      if (keyring) {
        delete keyrings[opts.keyring]
        keyring.storage.close()
      }

      if (!didResolve && !state.aborted) {
        done(notFound())
      }
    }
  })()
}

module.exports = {
  resolve
}
