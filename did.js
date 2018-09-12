const { toHex } = require('./util')
const isBuffer = require('is-buffer')
const { DID } = require('did-uri')

const DID_ARA_METHOD = 'ara'

/**
 * Creates a DID document (DDO) from an identitier.
 * @public
 * @param {String|Buffer} identitier
 * @param {?(String)} [method]
 * @return {Object}
 * @throws TypeError
 */
function create(identitier, method) {
  if (!identitier) {
    throw new TypeError('Expecting identitier.')
  }

  if ('string' !== typeof identitier && false === isBuffer(identitier)) {
    throw new TypeError('Expecting identitier to be a string or buffer.')
  }

  if (method && 'string' !== typeof method) {
    throw new TypeError('Expecting method to be a string.')
  }

  const id = toHex(identitier)
  const didMethod = method || DID_ARA_METHOD
  const uri = `did:${didMethod}:${id}`
  return new DID(uri)
}

/**
 * Normalizes a given DID URI
 * @public
 * @return {String}
 * @throws TypeError
 */
function normalize(uri, method) {
  if (!uri) {
    throw new TypeError('Expecting URI.')
  }

  if ('string' !== typeof uri) {
    throw new TypeError('Expecting uri to be a string or buffer.')
  }

  if (method && 'string' !== typeof method) {
    throw new TypeError('Expecting method to be a string.')
  }

  const prefix = `did:${method || DID_ARA_METHOD}:`

  if (prefix !== uri.slice(0, prefix.length)) {
    return prefix + uri
  }

  return uri
}

module.exports = {
  normalize,
  create,
}
