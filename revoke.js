const { resolve } = require('./resolve')
const { create } = require('./create')
const context = require('ara-context')()
const crypto = require('ara-crypto')
const bip39 = require('bip39')

/**
 * Revoke an identity using a bip39 mnemonic
 * @public
 * @param {object} opts
 * @param {string} opts.mnemonic
 * @param {string} opts.password
 * @throws TypeError
 * @return {object}
 */

async function revoke(opts) {
  if (null == opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  }

  if (null == opts.mnemonic) {
    throw new TypeError('Expecting mnemonic for revoking.')
  } else if (opts.mnemonic && 'string' !== typeof opts.mnemonic) {
    throw new TypeError('Expecting mnemonic to be a string.')
  }

  if (!bip39.validateMnemonic(opts.mnemonic)) {
    throw new TypeError('Expecting a valid bip39 mnemonic for revoking.')
  }

  if (null == opts.password) {
    throw new TypeError('Expecting password.')
  } else if (opts.password && 'string' !== typeof opts.password) {
    throw new TypeError('Expecting password to be a string.')
  }

  if (!opts.context) {
    opts.context = context
  }

  const seed = crypto.blake2b(bip39.mnemonicToSeed(opts.mnemonic))
  const { publicKey } = crypto.keyPair(seed)

  let ddo
  try {
    ddo = await resolve(publicKey.toString('hex'))
  } catch (err) {
    throw new Error('Could not resolve DID for the provided mnemonic')
  }

  opts.created = ddo.created

  if (ddo.revoked && 'string' == typeof ddo.revoked) {
    throw new Error('DID for the provided mnemonic has already been revoked')
  }
  opts.revoked = true

  const identity = await create(opts)
  return identity
}

module.exports = {
  revoke
}
