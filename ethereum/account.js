'use strict'

const { entropy } = require('./entropy')

async function create({web3, entropy: E} = {}) {
  E = await entropy(E)
  return web3.eth.accounts.create(E)
}

async function load() {
}

module.exports = {
  create, load
}
