'use strict'

const protobuf = require('./protobuf')
const crypto = require('ara-crypto')

function encrypt(keys, secretKey) {
  const iv = crypto.randomBytes(16)
  const key = secretKey.slice(0, 16)
  const flat = keys.map(map)
  const signature = crypto.blake2b(Buffer.concat(flat))
  const buffer = protobuf.messages.Keys.encode({signature, keys})
  return crypto.encrypt(buffer, {key, iv})
  function map({publicKey, secretKey}) {
    return Buffer.concat([publicKey, secretKey])
  }
}

function decrypt(doc, secretKey) {
  const key = secretKey.slice(0, 16)
  const buffer = crypto.decrypt(doc, {key})
  const keys = protobuf.messages.Keys.decode(buffer)
  return keys
}

module.exports = {
  encrypt,
  decrypt,
}
