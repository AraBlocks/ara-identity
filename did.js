const { toHex } = require('./util')
const isBuffer = require('is-buffer')
const { DID } = require('did-uri')

const DID_ARA_METHOD = 'ara'

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

  const prefix = `did:${method || DID_ARA_METHOD}:`

  if (prefix !== uri.slice(0, prefix.length)) {
    return prefix + uri
  }

  return uri
}

/**
 * Normalizes a given DID URI into just the identifier
 * @public
 * @return {String}
 * @throws TypeError
 */
function getIdentifier(uri, method) {
  if (!uri) {
    throw new TypeError('Expecting URI.')
  }

  if ('string' !== typeof uri) {
    throw new TypeError('Expecting URI to be a string or buffer.')
  }

  if (method && 'string' !== typeof method) {
    throw new TypeError('Expecting method to be a string.')
  }

  const identifier = uri.replace('did:ara:', '')

  return identifier
}

module.exports = {
  getIdentifier,
  normalize,
  create,
}
