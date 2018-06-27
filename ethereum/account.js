const { entropy } = require('./entropy')

/**
 * Creates an Ethereum account with web3 specified by
 * an optional entropy value.
 * @public
 * @param {Object} opts
 * @param {Object} opts.web3
 * @param {Number} opts.entropy
 * @throws TypeError
 * @return {Object}
 */
async function create(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('ethereum.account.create: Expecting object.')
  } else if (!opts.web3 || 'object' !== typeof opts.web3) {
    throw new TypeError('ethereum.account.create: Expecting web3 to be an object.')
  }

  const { web3 } = opts
  const account = web3.eth.accounts.create(await entropy(opts.entropy))
  return account
}

async function load() {
  return null
}

module.exports = {
  create,
  load,
}
