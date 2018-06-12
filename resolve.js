'use strict'

const { createChannel } = require('ara-network/discovery/channel')
const secrets = require('ara-network/secrets')
const { toHex } = require('./util')
const protobuf = require('./protobuf')
const secrets = require('ara-network/secrets')
const { DID } = require('did-uri')
const crypto = require('ara-crypto')
const debug = require('debug')('ara:identity:resolve')
const fetch = require('got')
const path = require('path')
const pify = require('pify')
const fs = require('fs')
const rc = require('./rc')()

const kDIDIdentifierLength = 64
const kResolutionTimeout = 5000 // in milliseconds
const kDIDMethod = 'ara'
const kMaxMeers = 8

async function resolve(uri, opts) {
  const did = new DID(uri)
  if (kDIDMethod != did.method) {
    throw new TypeError(
      `resolve: Invalid DID method (${did.method}). ` +
      `Expecting 'did:${kDIDMethod}:...'.`
    )
  }

  if (null == did.identifier || kDIDIdentifierLength != did.identifier.length) {
    throw new TypeError("resolve: Invalid DID identifier length.")
  }

  const hash = toHex(crypto.blake2b(Buffer.from(did.identifier, 'hex')))
  const file = path.resolve(rc.network.identity.root, hash, 'identity')

  if (false !== opts.cache) {
    try {
      await pify(fs.access)(file)
      const buffer = await pify(fs.readFile)(file)
      const identity = protobuf.messages.Identity.decode(buffer)
      for (const k in identity.files) {
        const { path, buffer } = identity.files[k]
        if ('ddo.json' == path) {
          return JSON.parse(buffer)
        }
      }
    } catch (err) { debug(err) }
  }

  if (opts.keystore) {
    return await findResolution(did, opts)
  }

  return null
}

async function findResolution(did, opts) {
  const { key, keystore } = opts
  const resolvers = []
  const channel = createChannel()
  const keys = secrets.decrypt({keystore}, {key})
  let timeout = null

  if (null == opts.timeout || 'number' != typeof opts.timeout) {
    opts.timeout = kResolutionTimeout
  }

  return pify((done) => {
    channel.on('peer', onpeer)
    channel.join(keys.discoveryKey)
    timeout = setTimeout(doResolution, opts.timeout)

    function onpeer(id, peer, type) {
      if (resolvers.push({id, peer, type}) < kMaxMeers) {
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
        return done(Object.assign(new Error("Could not resolve DID."),
          {status: 404, code: 'ENOTFOUND'}))
      }
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
