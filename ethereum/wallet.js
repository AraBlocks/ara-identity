const { ethHexToBuffer } = require('../util')
const { fromMasterSeed } = require('ethereumjs-wallet/hdkey')
const crypto = require('ara-crypto')
const bip39 = require('bip39')

async function load(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('ethereum.wallet.load: Expecting object.')
  } else if (!opts.mnemonicSeed) {
    throw new TypeError('ethereum.wallet.load: Expecting mnemonic seed to create wallet.')
  }
  const { mnemonicSeed } = opts
  const wallet = fromMasterSeed(mnemonicSeed)
  mnemonicSeed.fill(0)
  return wallet

}

module.exports = {
  load
}
