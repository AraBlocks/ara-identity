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
  const { seed } = opts
  const master = fromMasterSeed(seed)
  return master.getWallet()
}

module.exports = {
  load
}
