const context = require('ara-context')()
const { create } = require('../create')
const { list } = require('../list')
const util = require('../util')
const test = require('ava')

test('list()', async (t) => {
  const identity = await create({ context, password: 'password123' })
  util.writeIdentity(identity)
  const identities = await list()
  t.true(null !== identities)
  t.true('object' === typeof identities)
  await t.throws(list('identities'), Error, 'Cannot read directory identities')
})
