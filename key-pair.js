'use strict'

const crypto = require('ara-crypto')

/**
 * Generates a public and secret key pair
 * from a pair of randomly generated key pairs.
 * @public
 * @return {Object}
 */
function keyPair() {
  const seed = Buffer.concat([crypto.randomBytes(16), crypto.randomBytes(16)])
  const { publicKey, secretKey } = crypto.keyPair(seed)
  return { publicKey, secretKey }
}

module.exports = {
  keyPair
}
