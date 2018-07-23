const { fromMasterSeed } = require('ethereumjs-wallet/hdkey')
const isBuffer = require('is-buffer')

async function load(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('ethereum.wallet.load: Expecting object.')
  }
  if (!opts.mnemonicSeed) {
    throw new TypeError('ethereum.wallet.load: Expecting mnemonic seed to create wallets.')
  }
  if ('string' !== typeof opts.mnemonicSeed && false === isBuffer(opts.mnemonicSeed)) {
    throw new TypeError('ethereum.wallet.load: Expecting mnemonic seed to be a string or buffer.')
  }
  const { mnemonicSeed } = opts
  const wallet = fromMasterSeed(mnemonicSeed)
  mnemonicSeed.fill(0)
  return wallet
}

module.exports = {
  load
}
