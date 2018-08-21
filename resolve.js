const { createChannel } = require('ara-network/discovery/channel')
const { unpack, keyRing } = require('ara-network/keys')
const { toHex } = require('./util')
const protobuf = require('./protobuf')
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
  console.log(hash)
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
    } catch (err) { debug(err) }
  }

  if (opts.keys || opts.keyring) {
    const value = await findResolution(did, opts)
    return value
  }

  return null
}

async function findResolution(did, opts) {
  const resolvers = []
  let discoveryKey = null
  if (null == opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting options object.')
  }

  if (undefined == opts.secret && undefined == opts.keys) {
    throw new TypeError('Expecting shared network secret')
  }

  if (undefined == opts.keyring && undefined == opts.keys) {
    throw new TypeError('Expecting public network keys for the archiver node')
  }

  if (undefined == opts.name && undefined == opts.keys) {
    throw new TypeError('Expecting name for the archiver nodes key ring')
  }

  if (undefined == opts.keys) {
    const secret = Buffer.from(opts.secret)
    const keyring = keyRing(opts.keyring, { secret })
    const buffer = await keyring.get(opts.name)
    const unpacked = unpack({ buffer })
    // eslint-disable-next-line prefer-destructuring
    discoveryKey = unpacked.discoveryKey
  } else {
    // eslint-disable-next-line prefer-destructuring
    discoveryKey = opts.keys.discoveryKey
  }

  const channel = createChannel()
  let timeout = null

  if (null === opts.timeout || 'number' !== typeof opts.timeout) {
    // eslint-disable-next-line no-param-reassign
    opts.timeout = kResolutionTimeout
  }

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
          new Error('Could not resolve DID.'),
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
