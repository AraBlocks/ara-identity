/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
const { fromMasterSeed } = require('ethereumjs-wallet/hdkey')
const isZeroBuffer = require('is-zero-buffer')
const isBuffer = require('is-buffer')

const DERIVATION_PATH = 'm/44\'/60\'/0\'/0/'

async function load(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting object.')
  }

  if (!opts.seed) {
    throw new TypeError('Expecting seed to create wallet.')
  }

  const index = 0 < opts.index ? opts.index : 0

  if (false === isBuffer(opts.seed) || true === isZeroBuffer(opts.seed)) {
    throw new TypeError('Expecting seed to be a non-zero buffer.')
  }

  const { seed } = opts
  const hdWallet = fromMasterSeed(seed)

  return hdWallet.derivePath(`${DERIVATION_PATH}${index}`).getWallet()
}

module.exports = {
  load
}
