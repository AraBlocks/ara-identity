const { DID } = require('did-uri')
const crypto = require('ara-crypto')
const { resolve } = require('./resolve')

const OWNER = 'owner'

async function verify(uri, signature, message, opts) {
  const ddo = await resolve(uri, opts)
  let publicKey = null
  for (const pk of ddo.publicKey) {
    const { fragment } = new DID(pk.id)
    if (OWNER === fragment) {
      publicKey = Buffer.from(pk.publicKeyHex, 'hex')
    }
  }
  return crypto.ed25519.verify(signature, Buffer.from(message), publicKey)
}

module.exports = {
  verify
}
