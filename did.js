'use strict'

const { toHex } = require('./util')
const isBuffer = require('is-buffer')
const { DID } = require('did-uri')

const kDIDMethod = 'ara'

/**
 * Creates a DID document (DDO) from an identitier.
 * @public
 * @param {String|Buffer} identitier
 * @param {?(String)} [method]
 * @return {Object}
 * @throws TypeError
 */
function create(identitier, method) {
  if (null == identitier) {
    throw new TypeError("ara-identitier.did.create: Expecting identitier.")
  }

  if ('string' != typeof identitier && false == isBuffer(identitier)) {
    throw new TypeError(
      "ara-identitier.did.create: Expecting identitier to be a string or buffer.")
  }

  if (method && 'string' != typeof method) {
    throw new TypeError("ara-identitier.did.create: Expecting method to be a string.")
  }

  identitier = toHex(identitier)
  method = method || kDIDMethod
  const uri = `did:${method}:${identitier}`
  return new DID(uri)
}

module.exports = {
  create
}
