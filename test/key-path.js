const { createIdentityKeyPath } = require('../key-path')
const { writeIdentity } = require('../util')
const { create } = require('../create')
const context = require('ara-context')()
const rimraf = require('rimraf')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

test('createIdentityKeyPath(identity) invalid identity', (t) => {
  t.throws(() => createIdentityKeyPath(), TypeError)
  t.throws(() => createIdentityKeyPath('did:ara:1234'), TypeError)
})

test('createIdentityKeyPath(identity) valid identity', async (t) => {
  // create test identity
  const password = 'myPass'
  const identity = await create({ context, password })
  await writeIdentity(identity)

  const path = createIdentityKeyPath(identity)
  t.true(path && 'string' === typeof path)
  t.notThrows(async () => pify(fs.access)(path))

  // cleanup
  pify(rimraf)(path)
})
