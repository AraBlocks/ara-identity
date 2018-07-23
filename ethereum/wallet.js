const { fromMasterSeed } = require('ethereumjs-wallet/hdkey')
const isBuffer = require('is-buffer')

async function load(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('ethereum.wallet.load: Expecting object.')
  }
  if (!opts.seed) {
    throw new TypeError('ethereum.wallet.load: Expecting seed to create wallet.')
  }
  if (false === isBuffer(opts.seed)) {
    throw new TypeError('ethereum.wallet.load: Expecting seed to be a buffer.')
  }
  const { mnemonicSeed } = opts
  const master = fromMasterSeed(mnemonicSeed)
  return master.getWallet()
}

module.exports = {
  load
}
