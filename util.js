'use strict'

function toHex(value) {
  if (Buffer.isBuffer(value)) {
    return value.toString('hex')
  } else if (value) {
    return toHex(Buffer.from(value))
  } else {
    return toHex(Buffer.from(0))
  }
}

module.exports = {
  toHex
}
