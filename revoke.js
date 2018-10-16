const { create } = require('./create')
const fs = require('./fs')
const crypto = require('ara-crypto')
const { DID } = require('did-uri')
const bip39 = require('bip39')
const protobuf = require('./protobuf')
const debug = require('debug')('ara:identity:revoke')

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
  const seed = crypto.blake2b(bip39.mnemonicToSeed(opts.mnemonic))
  const { publicKey, secretKey } = crypto.keyPair(seed)

  try {
    await fs.access(publicKey.toString('hex'), 'identity', opts)
    const buffer = await fs.readFile(publicKey.toString('hex'), 'identity', opts)
    const identity = protobuf.messages.Identity.decode(buffer)
    for (const k in identity.files) {
      // eslint-disable-next-line no-shadow
      const { path, buffer } = identity.files[k]
      if ('ddo.json' === path) {
        opts.created = JSON.parse(buffer).created
      }
    }
  } catch (err) {
    debug(err)
  }

  opts.revoked = true
  //console.log(opts)
  const identity = await create(opts)
  return identity
}

module.exports = {
  revoke
}
