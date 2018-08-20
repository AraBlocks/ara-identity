const { resolve } = require('path')
const crypto = require('ara-crypto')
const rc = require('./rc')()

/**
 * Generate path to stored local identity
 * @param  {Object} identity
 * @return {String}
 * @throws {TypeError}
 */
function createIdentityKeyPath(identity) {
  if (null == identity || 'object' !== typeof identity) {
    throw new TypeError('util.createIdentityKeyPath: Expecting identity object')
  }

  const { root } = rc.network.identity
  let { publicKey } = identity

  if (Array.isArray(publicKey) && 0 < publicKey.length) {
    const { publicKeyHex } = publicKey[0]
    publicKey = Buffer.from(publicKeyHex, 'hex')
  }

  const hash = crypto.blake2b(publicKey).toString('hex')
  return resolve(root, hash)
}

module.exports = {
  createIdentityKeyPath
}
