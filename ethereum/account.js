const { toHex, toBuffer } = require('../util')
const { recover } = require('./keystore')
const { resolve } = require('path')
const isBuffer = require('is-buffer')
const crypto = require('ara-crypto')
const pify = require('pify')
const rc = require('../rc')()
const fs = require('fs')

/**
 * Creates an Ethereum account with web3 specified by
 * an optional entropy value.
 *
 * @public
 * @param {Object} opts
 * @param {Object} opts.web3
 * @param {Number} opts.entropy
 * @return {Object}
 * @throws TypeError
 */
async function create(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting object.')
  }

  if (!opts.web3 || 'object' !== typeof opts.web3) {
    throw new TypeError('Expecting web3 to be an object.')
  }

  if (!opts.privateKey || false === isBuffer(opts.privateKey)) {
    throw new TypeError('Expecting privateKey to be a buffer')
  }

  const { web3 } = opts
  const privateKey = web3.utils.bytesToHex(opts.privateKey)
  const account = web3.eth.accounts.privateKeyToAccount(privateKey)
  return account
}

/**
 * Loads an Ethereum account based on a publicKey
 * and password.
 *
 * @public
 * @param {Object} opts
 * @param {Object} opts.web3
 * @param {Object} opts.publicKey
 * @param {Object} opts.password
 * @returns {Object}
 * @throws {TypeError}
 */
async function load(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('ethereum.account.load: Expecting object')
  }

  if (!opts.web3 || 'object' !== typeof opts.web3) {
    throw new TypeError('ethereum.account.load: Expecting web3 object')
  }

  if (!opts.publicKey || ('string' !== typeof opts.publicKey
    && !isBuffer(opts.publicKey))) {
    throw new TypeError('ethereum.account.load: Expecting public key to be string or buffer')
  }

  if (!opts.password || 'string' !== typeof opts.password) {
    throw new TypeError('ethereum.account.load: Expecting password to be non-empty string')
  }

  const { web3 } = opts

  const publicKey = toBuffer(opts.publicKey)
  const hash = toHex(crypto.blake2b(publicKey))

  let encryptedKeystore
  let keys

  const araKeystorePath = resolve(
    rc.network.identity.root,
    hash,
    'keystore',
    'ara'
  )

  const ethKeystorePath = resolve(
    rc.network.identity.root,
    hash,
    'keystore',
    'eth'
  )

  try {
    keys = await pify(fs.readFile)(araKeystorePath, 'utf8')
    encryptedKeystore = await pify(fs.readFile)(ethKeystorePath, 'utf8')
  } catch (err) {
    throw new Error(err)
  }

  const buf = await recover(opts.password, keys, encryptedKeystore)
  const privateKey = web3.utils.bytesToHex(buf)

  return web3.eth.accounts.privateKeyToAccount(privateKey)
}

module.exports = {
  create,
  load,
}
