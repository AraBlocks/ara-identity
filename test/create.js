const context = require('ara-context')()
const { create } = require('../create')
const test = require('ava')

test('create() valid ARA id', async (t) => {
  const identity = await create({ context, password: 'password' })
  t.true('object' === typeof identity)
  t.true(null !== identity.mnemonic)
})

test('create() using invalid mnemonic', async (t) => {
  await t.throws(
    create({ context, password: 'password', mnemonic: 'exhaust' }),
    TypeError,
    'Expecting a valid bip39 mnemonic'
  )
})

test('create() valid ARA id using mnemonic', async (t) => {
  const identity = await create({ context, password: 'password', mnemonic: 'exhaust rescue vapor misery spot domain pink dice frown occur ice code' })
  t.true('object' === typeof identity)
})
