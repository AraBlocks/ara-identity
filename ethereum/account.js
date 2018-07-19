const { entropy } = require('./entropy')
const { recover } = require('./keystore')
const { toHex, toBuffer } = require('../util')
const fs = require('fs')
const pify = require('pify')
const rc = require('../rc')()
const crypto = require('ara-crypto')
const isBuffer = require('is-buffer')

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
  }

  const { web3 } = opts
  const account = web3.eth.accounts.create(await entropy(opts.entropy))
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

  const publicKey = toBuffer(opts.publicKey)
  const hash = toHex(crypto.blake2b(publicKey))

  const { ethKeystore } = rc.network.identity
  const parsedEth = parse(ethKeystore)

  const keystoreBase = basename(parsedEth.dir)
  parsedEth.dir = dirname(parsedEth.dir)
  const ethPath = resolve(parsedEth.dir, hash, keystoreBase, parsedEth.base)

  let keystore
  try {
    keystore = (await pify(fs.readFile)(ethPath)).toString()
  } catch (err) {
    throw new Error(err)
  }

  const { web3 } = opts
  const buf = await recover(opts.password, keystore)
  const privateKey = web3.utils.bytesToHex(buf)

  return web3.eth.accounts.privateKeyToAccount(privateKey)
}

module.exports = {
  create,
  load,
}
