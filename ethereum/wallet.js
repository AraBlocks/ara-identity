/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
const { fromMasterSeed } = require('ethereumjs-wallet/hdkey')
const isZeroBuffer = require('is-zero-buffer')
const isBuffer = require('is-buffer')

async function load(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting object.')
  }

  if (!opts.seed) {
    throw new TypeError('Expecting seed to create wallet.')
  }

  if (false === isBuffer(opts.seed) || true === isZeroBuffer(opts.seed)) {
    throw new TypeError('Expecting seed to be a non-zero buffer.')
  }

  const { seed } = opts
  const hdWallet = fromMasterSeed(seed)

  return hdWallet.derivePath("m/44'/60'/0'/0/0").getWallet()
}

module.exports = {
  load
}
