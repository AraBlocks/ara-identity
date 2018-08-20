const { createIdentityKeyPath } = require('../key-path')
const { create } = require('../create')
const context = require('ara-context')()
const test = require('ava')

test('createIdentityKeyPath(identity) invalid identity', (t) => {
  t.throws(() => createIdentityKeyPath(), TypeError)
  t.throws(() => createIdentityKeyPath('did:ara:1234'), TypeError)
})

test('createIdentityKeyPath(identity) valid identity', async (t) => {
  // create test identity
  const password = 'myPass'
  const identity = await create({ context, password })

  const path = createIdentityKeyPath(identity)
  t.true(path && 'string' === typeof path)
})
