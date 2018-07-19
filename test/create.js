const context = require('ara-context')()
const { create } = require('../create')
const test = require('ava')

test('create() valid ARA id', async (t) => {
  const identity = await create({ context, password: 'password' })
  t.true('object' === typeof identity)
  t.true(null !== identity.mnemonic)
})

test('create() valid ARA id using mnemonic', async (t) => {
  const identity = await create({ context, password: 'password', mnemonic: 'exhaust rescue vapor misery spot domain pink dice frown occur ice code' })
  t.true('object' === typeof identity)
})

test('create() valid ARA id generated using mnemonic', async (t) => {
  const identity1 = await create({ context, password: 'password', mnemonic: 'exhaust rescue vapor misery spot domain pink dice frown occur ice code' })
  const identity2 = await create({ context, password: 'password', mnemonic: 'exhaust rescue vapor misery spot domain pink dice frown occur ice code' })
  t.true(JSON.stringify(identity1.ddo.id) === JSON.stringify(identity2.ddo.id))
})
