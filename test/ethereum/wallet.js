

const { create } = require('../../ethereum/account')
const { load } = require('../../ethereum/wallet')
const test = require('ava')
const Web3 = require('web3')

const web3 = new Web3('http://127.0.0.1:9545')

test('ethereum.wallet.load(opts)', async (t) => {
  await t.throws(load(), TypeError)
  await t.throws(load(null), TypeError)
  await t.throws(load(0), TypeError)
  await t.throws(load(true), TypeError)
  await t.throws(load(NaN), TypeError)
  await t.throws(load({}), TypeError)

  const account = await create({ web3 })
  t.true(null != load({ account }))
})
