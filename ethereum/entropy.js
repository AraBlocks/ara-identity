'use strict'

const randombytes = require('randombytes')
const { toHex } = require('../util')

const kDefaultEntropySize = 32
const kMinEntropySize = 16

async function entropy(size) {
  if (null == size) { size = kDefaultEntropySize }
  if (!size || size < kMinEntropySize) {
    throw new TypeError(
      `entropy: Invalid entropy size. Must be larger than ${kMinEntropySize}.`
    )
  }

  return toHex(randombytes(size))
}

module.exports = {
  entropy
}
