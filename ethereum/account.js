const isBuffer = require('is-buffer')
const { recover } = require('./keystore')
const { toHex, toBuffer } = require('../util')
const fs = require('fs')
const pify = require('pify')
const rc = require('../rc')()
const crypto = require('ara-crypto')

const {
  resolve,
  parse,
  basename,
  dirname
} = require('path')

/**
 * Creates an Ethereum account with web3 specified by
 * an optional entropy value.
 * @public
 * @param {Object} opts
 * @param {Object} opts.web3
 * @param {Number} opts.entropy
 * @throws TypeError
 * @return {Object}
 */
async function create(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('ethereum.account.create: Expecting object.')
  } else if (!opts.web3 || 'object' !== typeof opts.web3) {
    throw new TypeError('ethereum.account.create: Expecting web3 to be an object.')
  } else if (!opts.privateKey || false === isBuffer(opts.privateKey)) {
    throw new TypeError('ethereum.account.create: Expecting privateKey to be a buffer')
  }

  const { web3 } = opts
  const privateKey = web3.utils.bytesToHex(opts.privateKey)
  const account = web3.eth.accounts.privateKeyToAccount(privateKey)
  return account
}

/**
 * Loads an Ethereum account based on a publicKey
 * and password.
 * @public
 * @param {Object} opts
 * @param {Object} opts.web3
 * @param {Object} opts.publicKey
 * @param {Object} opts.password
 * @throws {Error} If ethPath doesn't exist
 * @returns {Object} Resolved Ethereum account object
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

  const { araKeystore, ethKeystore } = rc.network.identity
  const araPath = _constructKeystorePath(araKeystore, hash)
  const ethPath = _constructKeystorePath(ethKeystore, hash)

  let keys
  let encryptedKeystore
  try {
    keys = await pify(fs.readFile)(araPath, 'utf8')
    encryptedKeystore = await pify(fs.readFile)(ethPath, 'utf8')
  } catch (err) {
    throw new Error(err)
  }

  const buf = await recover(opts.password, keys, encryptedKeystore)
  const privateKey = web3.utils.bytesToHex(buf)

  return web3.eth.accounts.privateKeyToAccount(privateKey)
}

function _constructKeystorePath(path, hash) {
  const parsedPath = parse(path)
  const keystoreBase = basename(parsedPath.dir)
  parsedPath.dir = dirname(parsedPath.dir)
  return resolve(parsedPath.dir, hash, keystoreBase, parsedPath.base)
}

module.exports = {
  create,
  load,
}
