const { createChannel } = require('ara-network/discovery/channel')
const { unpack, keyRing } = require('ara-network/keys')
const { toHex } = require('./util')
const protobuf = require('./protobuf')
const isBuffer = require('is-buffer')
const { DID } = require('did-uri')
const crypto = require('ara-crypto')
const debug = require('debug')('ara:identity:resolve')
const fetch = require('got')
const path = require('path')
const pify = require('pify')
const fs = require('fs')
const rc = require('./rc')()

const kDIDIdentifierLength = 64
// in milliseconds
const kResolutionTimeout = 5000
const kDIDMethod = 'ara'
const kMaxPeers = 8

async function resolve(uri, opts) {
  if (null == opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting options to be an object.')
  }

  if (0 !== uri.indexOf('did:ara:')) {
    // eslint-disable-next-line no-param-reassign
    uri = `did:ara:${uri}`
  }

  const did = new DID(uri)

  if (kDIDMethod !== did.method) {
    throw new TypeError(`resolve: Invalid DID method (${did.method}). ` +
      `Expecting 'did:${kDIDMethod}:...'.`)
  }

  if (!did.identifier || kDIDIdentifierLength !== did.identifier.length) {
    throw new TypeError('resolve: Invalid DID identifier length.')
  }

  const hash = toHex(crypto.blake2b(Buffer.from(did.identifier, 'hex')))
  const file = path.resolve(rc.network.identity.root, hash, 'identity')

  if (false !== opts.cache) {
    try {
      await pify(fs.access)(file)
      const buffer = await pify(fs.readFile)(file)
      const identity = protobuf.messages.Identity.decode(buffer)
      for (const k in identity.files) {
        // eslint-disable-next-line no-shadow
        const { path, buffer } = identity.files[k]
        if ('ddo.json' === path) {
          return JSON.parse(buffer)
        }
      }
    } catch (err) {
      debug(err)
    }
  }

  if ('string' !== typeof opts.secret && !isBuffer(opts.secret)) {
    throw new TypeError('Expecting shared secret to be a string or buffer.')
  }

  if (!opts.secret || 0 === opts.secret.length) {
    throw new TypeError('Shared secret cannot be empty.')
  }

  if (!opts.keyring) {
    throw new TypeError('Expecting network keys keyring.')
  }

  if (opts.name && 'string' === typeof opts.name && !opts.network) {
    const msg = 'Please set \'opts.network\' property instead of \'opts.name\'.'
    // eslint-disable-next-line no-console
    console.warn('aid.resolve():', msg)
    // eslint-disable-next-line no-param-reassign
    opts.network = opts.name
  }

  if (!opts.network || 'string' !== typeof opts.network) {
    throw new TypeError('Expecting network name for the resolver.')
  }

  if (null === opts.timeout || 'number' !== typeof opts.timeout) {
    // eslint-disable-next-line no-param-reassign
    opts.timeout = kResolutionTimeout
  }

  const value = await findResolution(did, opts)
  return value
}

async function findResolution(did, opts) {
  const resolvers = []
  const secret = Buffer.from(opts.secret)
  const keyring = keyRing(opts.keyring, { secret })
  await keyring.ready()
  const buffer = await keyring.get(opts.network)
  const unpacked = unpack({ buffer })
  const { discoveryKey } = unpacked

  const channel = createChannel()
  let timeout = null

  return pify((done) => {
    channel.on('peer', onpeer)
    channel.join(discoveryKey)
    timeout = setTimeout(doResolution, opts.timeout)

    function onpeer(id, peer, type) {
      if (resolvers.push({ id, peer, type }) < kMaxPeers) {
        doResolution()
      } else {
        cleanup()
      }
    }

    async function doResolution() {
      clearTimeout(timeout)
      timeout = setTimeout(doResolution, opts.timeout)
      if (resolvers.length) {
        const { peer } = resolvers.shift()
        const { host, port } = peer
        const uri = `http://${host}:${port}/1.0/identifiers/${did.did}`

        try {
          const { body } = await fetch(uri)
          done(null, JSON.parse(body))
          cleanup()
        } catch (err) {
          process.nextTick(doResolution)
        }
      } else {
        return done(Object.assign(
          new Error('Could not resolve DID. No peer found'),
          { status: 404, code: 'ENOTFOUND' }
        ))
      }
      return null
    }

    function cleanup() {
      clearTimeout(timeout)
      channel.removeListener('peer', onpeer)
      channel.destroy()
    }
  })()
}

module.exports = {
  resolve
}
