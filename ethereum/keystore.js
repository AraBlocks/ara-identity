const isBuffer = require('is-buffer')
const ks = require('keythereum')
const crypto = require('ara-crypto')
const protobuf = require('../protobuf')

const kKeyBytes = 32
const kIVBytes = 16

const kScryptParameters = {
  memory: 280000000,
  dklen: 32,
  kdf: 'scrypt',
  n: 262144,
  r: 1,
  p: 8
}

const kKDFParameters = kScryptParameters

/**
 * Creates a keystore object.
 * @public
 * @return {Object}
 */
async function create() {
  const opts = { keyBytes: kKeyBytes, ivBytes: kIVBytes }
  const keystore = await new Promise(resolve => ks.create(opts, resolve))
  return keystore
}

async function load() {
  // TODO(jwerle)
}

/**
 * Dumps a keystore object specified by a given password,
 * private key, salt, and iv.
 */
async function dump(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('ethereum.keystore.dump: Expecting object.')
  }

  if (!opts.password) {
    throw new TypeError('ethereum.keystore.dump: Expecting password.')
  } else if (!isBuffer(opts.password) && 'string' !== typeof opts.password) {
    throw new TypeError('ethereum.keystore.dump: Expecting password to be a string or buffer.')
  }

  if (!opts.privateKey) {
    throw new TypeError('ethereum.keystore.dump: Expecting private key.')
  } else if (!isBuffer(opts.privateKey) && 'string' !== typeof opts.privateKey) {
    throw new TypeError('ethereum.keystore.dump: Expecting private key to be a string or buffer.')
  }

  if (!opts.salt) {
    throw new TypeError('ethereum.keystore.dump: Expecting salt.')
  } else if (!isBuffer(opts.salt) && 'string' !== typeof opts.salt) {
    throw new TypeError('ethereum.keystore.dump: Expecting salt to be a string or buffer.')
  }

  if (!opts.iv) {
    throw new TypeError('ethereum.keystore.dump: Expecting iv.')
  } else if (!isBuffer(opts.iv) && 'string' !== typeof opts.iv) {
    throw new TypeError('ethereum.keystore.dump: Expecting iv to be a string or buffer.')
  }

  const {
    password, privateKey, salt, iv
  } = opts
  const object = await new Promise((resolve) => {
    const params = kKDFParameters
    ks.dump(password, privateKey, salt, iv, params, resolve)
  })

  return object
}

/**
 * Returns private ethereum key
 * @param {String} password
 * @param {JSON} keys
 * @param {JSON} encryptedKeystore
 * @return {Buffer}
 * Takes a the users password, the keys json string found in identity directory, as well
 * as the eth json string, found in the keystore directory within the identity directory. Uses password
 * to decrypt keys file, returning the secret key. Uses the secret key to decrypt the encryptedKeystore,
 * returning the ethereum private key in a buffer
 */

function recover(password, keys, encryptedKeystore) {
  password = crypto.blake2b(Buffer.from(password))
  const secretKey = crypto.decrypt(JSON.parse(keys), { key: password.slice(0, 16) })
  const bufferedSecretKey = Buffer.allocUnsafe(16).fill(secretKey.slice(0, 16))
  const keyObject = protobuf.messages.KeyStore.decode(crypto.decrypt(JSON.parse(encryptedKeystore), { key: bufferedSecretKey }))

  return new Promise(resolve => ks.recover(password, keyObject, resolve))
}

module.exports = {
  recover,
  create,
  dump,
  load,
}
