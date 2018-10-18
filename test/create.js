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

test('create() valid ARA id with service endpoints', async (t) => {
  t.plan(2)
  const service = []
  service.push({
    id: 'arasite',
    type: 'ara-site.Service',
    endpoint: 'http://www.ara.one',
    description: 'This is our project site'
  })
  service.push({
    id: 'aradev',
    type: 'ara-dev.Service',
    endpoint: 'http://www.ara.one/dev',
    description: 'This is our developer page',
    price: '10 Ara'
  })
  const identity = await create({ context, password: 'password', ddo: { service } })
  t.true(true === Array.isArray(identity.ddo.service))
  t.true(2 === identity.ddo.service.length)
})
