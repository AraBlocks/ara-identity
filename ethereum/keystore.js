const protobuf = require('../protobuf')
const isBuffer = require('is-buffer')
const crypto = require('ara-crypto')
const ss = require('ara-secret-storage')
const ks = require('keythereum')

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
    throw new TypeError('Expecting object.')
  }

  if (!opts.password) {
    throw new TypeError('Expecting password.')
  } else if (!isBuffer(opts.password) && 'string' !== typeof opts.password) {
    throw new TypeError('Expecting password to be a string or buffer.')
  }

  if (!opts.privateKey) {
    throw new TypeError('Expecting private key.')
  } else if (!isBuffer(opts.privateKey) && 'string' !== typeof opts.privateKey) {
    throw new TypeError('Expecting private key to be a string or buffer.')
  }

  if (!opts.salt) {
    throw new TypeError('Expecting salt.')
  } else if (!isBuffer(opts.salt) && 'string' !== typeof opts.salt) {
    throw new TypeError('Expecting salt to be a string or buffer.')
  }

  if (!opts.iv) {
    throw new TypeError('Expecting iv.')
  } else if (!isBuffer(opts.iv) && 'string' !== typeof opts.iv) {
    throw new TypeError('Expecting iv to be a string or buffer.')
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
 * Returns private ethereum key.
 * Takes the user's password, the keys json string found in identity directory,
 * as well as the eth json string, found in the keystore directory within the
 * identity directory. Uses password to decrypt keys file, returning the secret
 * key. Uses the secret key to decrypt the ethereumKeystore, returning the
 * ethereum private key in a buffer
 *
 * @public
 * @param {String|Buffer} password
 * @param {Buffer} araKeystore
 * @param {Buffer} ethereumKeystore
 * @return {Promise<Buffer>}
 */
function recover(password, araKeystore, ethereumKeystore) {
  // eslint-disable-next-line no-param-reassign
  ethereumKeystore = JSON.parse(ethereumKeystore)
  // eslint-disable-next-line no-param-reassign
  araKeystore = JSON.parse(araKeystore)
  // eslint-disable-next-line no-param-reassign
  password = crypto.blake2b(Buffer.from(password))

  const secretKey = ss.decrypt(araKeystore, { key: password.slice(0, 16) })
  const keystore = protobuf.messages.KeyStore.decode(ss.decrypt(
    ethereumKeystore,
    { key: secretKey.slice(0, 16) }
  ))

  return new Promise((resolve, reject) => {
    try {
      ks.recover(password, keystore, resolve)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  recover,
  create,
  dump,
  load,
}
