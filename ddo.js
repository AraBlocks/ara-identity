const { DIDDocument } = require('did-document')

/**
 * Creates a DIDDocument from a DID for a DID.
 * @public
 * @param {Object} opts
 * @param {Object} opts.id
 * @return {DIDDocument}
 * @throws TypeError
 */
function create(opts) {
  if (null == opts) {
    throw new TypeError('Expecting options object.')
  }

  if (null == opts.id) {
    throw new TypeError('Expecting DID identifier.')
  }

  return new DIDDocument(opts)
}

module.exports = {
  create
}
