'use strict'

const { DID } = require('did-uri')

const kDIDIdentifierLength = 64
const kDIDMethod = 'ara'

function resolve(uri) {
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

  // @TODO(jwerle): PING resolver
}

module.exports = {
  resolve
}
