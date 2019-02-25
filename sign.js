const { resolve } = require('./resolve')
const { DID } = require('did-uri')
const crypto = require('ara-crypto')
const ss = require('ara-secret-storage')
const fs = require('./fs')

async function sign(uri, message, opts) {
  const ddo = await resolve(uri, opts)
  const did = new DID(ddo.id)

  const buffer = await fs.readFile(did.identifier, 'keystore/ara', {
    cache: opts.cache,
    network: opts.network,
  })

  const keystore = JSON.parse(buffer)
  const password = crypto.blake2b(Buffer.from(opts.password))
  const secretKey = ss.decrypt(keystore, { key: password.slice(0, 16) })
  return crypto.ed25519.sign(Buffer.from(message), secretKey)
}

module.exports = {
  sign
}
