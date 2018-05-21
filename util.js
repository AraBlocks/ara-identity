'use strict'

const isBuffer = require('is-buffer')

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

/**
 * Convert a value, however possible, to a buffer
 * @public
 * @param {Mixed} value
 * @return {Buffer}
 */
function toBuffer(value) {
  if (isBuffer(value)) {
    return value
  } else if (value && 'number' == typeof value) {
    return Buffer.alloc(value)
  } else if ('string' == typeof value) {
    return ethHexToBuffer(value)
  } else if (value) {
    return Buffer.from(value)
  } else {
    return Buffer.alloc(0)
  }
}

module.exports = {
  ethHexToBuffer,
  toBuffer,
  toHex,
}
