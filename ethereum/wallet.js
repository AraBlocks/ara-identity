/* eslint-disable import/no-unresolved */
const { hdkey, default: Wallet } = require('ethereumjs-wallet')
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
  const hdWallet = hdkey.fromMasterSeed(seed)

  return hdWallet.derivePath(`${DERIVATION_PATH}${index}`).getWallet()
}

async function create(opts) {
  if (opts && opts.publicKey && !opts.privateKey) {
    return Wallet.fromPublicKey(opts.publicKey)
  }

  if (opts && opts.privateKey) {
    return Wallet.fromPrivateKey(opts.privateKey)
  }

  return new Wallet(opts.privateKey, opts.publicKey)
}

module.exports = {
  create,
  load
}
