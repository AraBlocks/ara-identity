const { create } = require('../../ethereum/account')
const test = require('ava')
const Web3 = require('web3')
const isBuffer = require('is-buffer')

const web3 = new Web3('http://127.0.0.1:9545')

test('ethereum.create({entropy})', async (t) => {
  await t.throws(create({ web3, privateKey: 0 }), TypeError, 'ethereum.account.create: Expecting privateKey to be a buffer')
  const account = await create({ web3, privateKey: Buffer.from('b06c21d8e52ce9f89c40695ce79c3349bacf90418f84137220c503d14e2b5e36') })
  t.true(null != account)
  t.true('object' === typeof account)
  t.true('string' === typeof account.address)
  t.true(true === isBuffer(account.privateKey))
})
