const isZeroBuffer = require('is-zero-buffer')
const isBuffer = require('is-buffer')

/* eslint-disable import/no-unresolved */
// attempt to load hdkey from ethereumjs
// see: https://github.com/ethereumjs/ethereumjs-wallet/issues/64
let hdkey = null
try { hdkey = require('ethereumjs-wallet/dist/hdkey') } catch (err) {
  try { hdkey = require('ethereumjs-wallet/hdkey') } catch (error) {
    throw new Error('Failed to load ethereumjs-wallet/hdkey.')
  }
}

const { fromMasterSeed } = hdkey

async function load(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('ethereum.wallet.load: Expecting object.')
  }
  if (!opts.seed) {
    throw new TypeError('ethereum.wallet.load: Expecting seed to create wallet.')
  }
  if (false === isBuffer(opts.seed) || true === isZeroBuffer(opts.seed)) {
    throw new TypeError('ethereum.wallet.load: Expecting seed to be a non-zero buffer.')
  }
  const { seed } = opts
  const master = fromMasterSeed(seed)
  return master.getWallet()
}

module.exports = {
  load
}
