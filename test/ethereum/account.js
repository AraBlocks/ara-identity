'use strict'

const { create } = require('../../ethereum/account')
const test = require('ava')
const Web3 = require('web3')

const provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545') // from truffle develop
const web3 = new Web3(provider)

test("create({entropy})", async (t) => {
  await t.throws(create({web3, entropy: 0}), TypeError, "entropy too small")
  await t.throws(create({web3, entropy: 1}), TypeError, "entropy too small")
  await t.throws(create({web3, entropy: -1}), TypeError, "entropy too small")
  await t.throws(create({web3, entropy: 15}), TypeError, "entropy too small")
  const account = await create({web3})
  t.true(null != account)
  t.true('object' == typeof account)
  t.true('string' == typeof account.address)
  t.true('string' == typeof account.privateKey)
})
