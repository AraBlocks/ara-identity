const randombytes = require('randombytes')
const { toHex } = require('../util')

const kDefaultEntropySize = 32
const kMinEntropySize = 16

async function entropy(size) {
  let entropySize = size
  if (null == entropySize) { entropySize = kDefaultEntropySize }
  if (!entropySize || entropySize < kMinEntropySize) {
    throw new TypeError(`entropy: Invalid entropy size. Must be larger than ${kMinEntropySize}.`)
  }

  return toHex(randombytes(entropySize))
}

module.exports = {
  entropy
}
