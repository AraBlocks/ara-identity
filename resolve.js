const { unpack, keyRing } = require('ara-network/keys')
const { createChannel } = require('ara-network/discovery/channel')
const protobuf = require('./protobuf')
const isBuffer = require('is-buffer')
const { DID } = require('did-uri')
const debug = require('debug')('ara:identity:resolve')
const fetch = require('got')
const pify = require('pify')
const dns = require('ara-identity-dns')
const fs = require('./fs')
const rc = require('./rc')()

const kDIDIdentifierLength = 64
// in milliseconds
const kResolutionTimeout = 5000
const kDIDMethod = 'ara'
const kMaxPeers = 8

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

  // is DID ?
  if (uri && 'object' === typeof uri && uri.did) {
    if ('string' === typeof uri.did) {
      uri = uri.did
    } else if ('object' === typeof uri.did) {
      uri = uri.did.reference
    }
  } else if ('string' === typeof uri && -1 === uri.indexOf('did:ara')) {
    try {
      const url = uri
      const resolution = await dns.resolve(url)
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

  if (kDIDMethod !== did.method) {
    throw new TypeError(`Invalid DID method (${did.method}). ` +
      `Expecting 'did:${kDIDMethod}:...'.`)
  }

  if (did.identifier && -1 !== did.identifier.indexOf('.')) {
    throw new TypeError(`Unable to resolve DID for domain: ${did.identifier}`)
  }

  if (!did.identifier || kDIDIdentifierLength !== did.identifier.length) {
    throw new TypeError('Invalid DID identifier length.')
  }

  const state = { aborted: false }
  const resolutions = []

  resolutions.push((async function local() {
    try {
      await fs.access(did.identifier, 'identity', opts)
      const buffer = await fs.readFile(did.identifier, 'identity', opts)
      const identity = protobuf.messages.Identity.decode(buffer)
      for (const k in identity.files) {
        if (state.aborted) { return null }
        // eslint-disable-next-line no-shadow
        const { path, buffer } = identity.files[k]
        if ('ddo.json' === path) {
          return JSON.parse(String(buffer))
        }
      }
    } catch (err) {
      debug(err)
    }

    return null
  }()))

  resolutions.push((async function remote() {
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
      opts.timeout = kResolutionTimeout
    }

    return findResolution(did, opts, state)
  })())

  return pify(async (done) => {
    let resolved = false
    const promises = []

    for (let i = 0; i < resolutions.length; ++i) {
      const resolution = resolutions[i]

      if (resolved) {
        break
      } else {
        promises.push(resolution.then(onthen))
      }
    }

    await Promise.all(promises).then(() => done(null)).catch(done)

    if (!resolved) {
      done(notFound())
    }

    function onthen(result) {
      if (result) {
        resolved = true
        state.aborted = true
        try {
          done(null, result)
        } catch (err) {
          debug(err)
        }
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

  const channel = createChannel()
  let didResolve = false
  let timeout = null

  return pify((done) => {
    channel.on('peer', onpeer)
    channel.join(discoveryKey)
    timeout = setTimeout(doResolution, opts.timeout)

    function onpeer(id, peer, type) {
      if (!state.aborted && resolvers.push({ id, peer, type }) < kMaxPeers) {
        doResolution()
      } else {
        cleanup()
      }
    }

    async function doResolution() {
      clearTimeout(timeout)

      if (!didResolve && 0 === resolvers.length && !state.aborted) {
        done(notFound())
      } else if (!state.aborted && !didResolve) {
        const { peer } = resolvers.shift()
        const { host, port } = peer
        const uri = `http://${host}:${port}/1.0/identifiers/${did.did}`

        timeout = setTimeout(doResolution, opts.timeout)

        try {
          const { body } = await fetch(uri)
          const response = JSON.parse(body)
          didResolve = true
          done(null, response.didDocument)
          cleanup()
        } catch (err) {
          process.nextTick(doResolution)
        }
      }
    }

    function cleanup() {
      clearTimeout(timeout)
      channel.removeListener('peer', onpeer)
      channel.destroy()

      if (!didResolve && !state.aborted) {
        notFound()
      }
    }
  })()
}

module.exports = {
  resolve
}
