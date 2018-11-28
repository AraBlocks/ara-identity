const { toHex } = require('./util')
const isBuffer = require('is-buffer')
const { DID } = require('did-uri')

const DID_ARA_METHOD = 'ara'
const IDENTIFIER_LENGTH = 64

/**
 * Creates a DID document (DDO) from an identifier.
 * @public
 * @param {String|Buffer} identifier
 * @param {?(String)} [method]
 * @return {Object}
 * @throws TypeError
 */
function create(identifier, method) {
  if (!identifier) {
    throw new TypeError('Expecting identifier.')
  }

  if ('string' !== typeof identifier && false === isBuffer(identifier)) {
    throw new TypeError('Expecting identifier to be a string or buffer.')
  }

  if (method && 'string' !== typeof method) {
    throw new TypeError('Expecting method to be a string.')
  }

  const id = toHex(identifier)
  const didMethod = method || DID_ARA_METHOD
  const uri = `did:${didMethod}:${id}`
  return new DID(uri)
}

/**
 * Normalizes a given DID URI to Prefix & Identifier
 * @public
 * @return {String}
 * @throws TypeError
 */
function normalize(uri, method) {
  if (!uri) {
    throw new TypeError('Expecting URI.')
  }

  if ('string' !== typeof uri) {
    throw new TypeError('Expecting URI to be a string or buffer.')
  }

  if (method && 'string' !== typeof method) {
    throw new TypeError('Expecting method to be a string.')
  }

  method = method || DID_ARA_METHOD

  const prefix = `did:${method}:`

  if (prefix !== uri.slice(0, prefix.length)) {
    if (DID_ARA_METHOD === method && uri.length !== IDENTIFIER_LENGTH) {
      throw new Error(`Expecting Ara URI to be of length ${IDENTIFIER_LENGTH}. Got ${uri}. Ensure Ara URI is a valid hex string.`)
    }
    return prefix + uri
  }

  return uri
}

module.exports = {
  normalize,
  create,
}
