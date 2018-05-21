'use strict'

/**
 * Converts a buffer to a hex string.
 * @public
 * @param {Buffer} value
 * @return {String}
 */
function toHex(value) {
  if (Buffer.isBuffer(value)) {
    return value.toString('hex')
  } else if (value) {
    return toHex(Buffer.from(value))
  } else {
    return toHex(Buffer.from(0))
  }
}

/**
 * Converts an ethereum style hex string into
 * a buffer. This function will return `null'
 * on input that is not a 'string' type.
 * @public
 * @param {String} hex
 * @return {Buffer|null}
 */
function ethHexToBuffer(hex) {
  if (hex && 'string' == typeof hex) {
    if ('0x' == hex.slice(0, 2)) {
      return Buffer.from(hex.slice(2), 'hex')
    } else {
      return Buffer.from(hex, 'hex')
    }
  }
  return null
}

module.exports = {
  ethHexToBuffer,
  toHex,
}
