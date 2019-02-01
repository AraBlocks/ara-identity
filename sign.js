const { resolve } = require('./resolve')
const crypto = require('ara-crypto')
const ss = require('ara-secret-storage')
const fs = require('./fs')

async function sign(uri, message, opts) {
  const ddo = await resolve(uri, opts)
  const keystore = JSON.parse(await fs.readFile(ddo.id, 'keystore/ara', opts))
  const password = crypto.blake2b(Buffer.from(opts.password))
  const secretKey = ss.decrypt(keystore, { key: password.slice(0, 16) })
  return crypto.ed25519.sign(Buffer.from(message), secretKey)
}

module.exports = {
  sign
}
