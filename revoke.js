const { create } = require('./create')
const { DID } = require('did-uri')
const bip39 = require('bip39')

/**
 * Revoke an identity using a bip39 mnemonic
 * @public
 * @param {object} opts
 * @param {string} opts.mnemonic
 * @throws TypeError
 * @return {object}
 */

async function revoke(opts) {
  if (null == opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  }

  if (null == opts.mnemonic) {
    throw new TypeError('Expecting mnemonic for recovery.')
  } else if (opts.mnemonic && 'string' !== typeof opts.mnemonic) {
    throw new TypeError('Expecting mnemonic to be a string.')
  }

  if (!bip39.validateMnemonic(opts.mnemonic)) {
    throw new TypeError('Expecting a valid bip39 mnemonic for recovery.')
  }

  opts.revoked = (new Date()).toISOString()

  const identity = await create(opts)
  return identity
}

module.exports = {
  revoke
}
