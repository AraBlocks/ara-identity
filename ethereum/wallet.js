

const { ethHexToBuffer } = require('../util')
const { fromPrivateKey } = require('ethereumjs-wallet')

async function load(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('ethereum.wallet.load: Expecting object.')
  } else if (!opts.account || 'object' !== typeof opts.account) {
    throw new TypeError('ethereum.wallet.load: Expecting account to be an object.')
  }

  const { account } = opts

  if (account.privateKey) {
    const privateKey = ethHexToBuffer(account.privateKey)
    return fromPrivateKey(privateKey)
  }

  return null
}

module.exports = {
  load
}
