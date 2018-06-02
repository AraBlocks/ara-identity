'use strict'

const { createChannel } = require('ara-network/channel')
const secrets = require('ara-network/secrets')
const { DID } = require('did-uri')
const fetch = require('got')
const pify = require('pify')

const kDIDIdentifierLength = 64
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

  const result = await findResolution(did, opts)

  return result
}

async function findResolution(did, opts) {
  const channel = createChannel()
  const { key, keystore } = opts
  const keys = secrets.decrypt({keystore}, {key})
  const resolvers = []

  return pify((done) => {
    let timeout = setTimeout(doResolution, 250)

    channel.on('peer', onpeer)
    channel.join(keys.discoveryKey)

    function onpeer(id, peer, type) {
      clearTimeout(timeout)
      if (resolvers.push({id, peer, type}) < kMaxMeers) {
        timeout = setTimeout(doResolution)
      } else {
        cleanup()
      }
    }

    async function doResolution() {
      if (resolvers.length) {
        clearTimeout(timeout)
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
