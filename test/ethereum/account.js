const { create, load } = require('../../ethereum/account')
const { create: createIdentity } = require('../../create')
const { writeIdentity } = require('../../util')
const context = require('ara-context')()
const test = require('ava')
const Web3 = require('web3')

const web3 = new Web3('http://127.0.0.1:9545')
const password = 'password'

test('ethereum.create({entropy})', async (t) => {
  await t.throwsAsync(create({ web3, privateKey: 0 }), {instanceOf: TypeError}, 'ethereum.account.create: Expecting privateKey to be a buffer')
  const account = await create({ web3, privateKey: Buffer.from('b06c21d8e52ce9f89c40695ce79c3349bacf90418f84137220c503d14e2b5e36') })
  t.true(null != account)
  t.true('object' === typeof account)
  t.true('string' === typeof account.address)
  t.true('string' === typeof account.privateKey)
})

test('ethereum.load({opts}) invalid args', async (t) => {
  await t.throwsAsync(load(), {instanceOf: TypeError}, 'Expecting opts object')
  await t.throwsAsync(load({ web3: null }), {instanceOf: TypeError}, 'Expecting web3 object')
  await t.throwsAsync(load({ web3, publicKey: 1234 }), {instanceOf: TypeError}, 'Expecting publicKey to be non-empty string')
  await t.throwsAsync(load({
    web3,
    publicKey: 'b06c21d8e52ce9f89c40695ce79c3349bacf90418f84137220c503d14e2b5e36',
    password: 1234
  }), {instanceOf: TypeError}, 'Expecting password to be a string')
})

test('ethereum.load({opts}) valid args', async (t) => {
  // create account
  const identity = await createIdentity({ context, password })
  await writeIdentity(identity)
  const { publicKey, account } = identity

  // reload account
  const loadedAccount = await load({
    web3,
    publicKey,
    password
  })
  t.is(account.address, loadedAccount.address)
  t.is(account.privateKey, loadedAccount.privateKey)
})
