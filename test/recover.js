const context = require('ara-context')()
const { create } = require('../create')
const { recover } = require('../recover')
const bip39 = require('bip39')
const test = require('ava')

test('recover() invalid opts', async (t) => {
  await t.throws(recover(), TypeError, 'Expecting opts to be an object.')
  await t.throws(recover({context}), TypeError, 'Expecting password for recovery.')
  await t.throws(recover({context, password: 123}), TypeError, 'Expecting mnemonic for recovery.')
  await t.throws(recover({context, password: 123, mnemonic: 1234}), TypeError, 'Expecting mnemonic to be a string.')
  await t.throws(recover({context, password: 123, mnemonic: 'hello how'}), TypeError, 'Expecting a valid bip39 mnemonic for recovery.')
})

test('recover() using valid mnemonic', async (t) => {
  const mnemonic = bip39.generateMnemonic()
  const identity = await recover({ context, password: 'password' ,mnemonic})
  t.true('object' === typeof identity)
  t.true(mnemonic === identity.mnemonic)
})

test('recover() compare recovered identity', async (t) => {
  const identity = await create({context, password: '123'})
  const mnemonic = identity.mnemonic
  const recoveredID = await recover({context, password: 'hello', mnemonic})
  t.true(identity.account.privateKey === recoveredID.account.privateKey)
  t.true(identity.mnemonic === recoveredID.mnemonic)
  t.true(0 === Buffer.compare(identity.publicKey, recoveredID.publicKey))
  t.true(0 === Buffer.compare(identity.secretKey, recoveredID.secretKey))
  t.true(0 === Buffer.compare(identity.wallet._privKey, recoveredID.wallet._privKey))
  t.true(0 === Buffer.compare(identity.wallet._pubKey, recoveredID.wallet._pubKey))
})
