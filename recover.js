const bip39 = require('bip39')
const { create } = require('./create')

/**
 * Recover an Identity using a bip39 mnemonic
 * @public
 * @param {object} opts
 * @param {object} opts.context
 * @param {string} opts.password
 * @param {string} opts.mnemonic
 * @param {array} opts.ddo (optional)
 * @throws TypeError
 * @return {object}
 */

async function recover(opts) {
  if (null == opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  }

  if (null == opts.password) {
    throw new TypeError('Expecting password for recovery.')
  }

  if (null == opts.context || 'object' !== typeof opts.context) {
    throw new TypeError('Expecting context object.')
  }

  if (null == opts.context.web3 || 'object' !== typeof opts.context.web3) {
    throw new TypeError('Expecting web3 to be in context.')
  }

  if (null == opts.mnemonic) {
    throw new TypeError('Expecting mnemonic for recovery.')
  } else if (opts.mnemonic && 'string' !== typeof opts.mnemonic) {
    throw new TypeError('Expecting mnemonic to be a string.')
  }

  if (!bip39.validateMnemonic(opts.mnemonic)) {
    throw new TypeError('Expecting a valid bip39 mnemonic for recovery.')
  }

  const identity = await create(opts)
  return identity
}

module.exports = {
  recover
}
