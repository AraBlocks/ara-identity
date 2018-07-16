const { list } = require('../list')
const test = require('ava')

test('list()', async (t) => {
  t.plan(3)
  const identities = await list()
  t.true(null !== identities)
  t.true('object' === typeof identities)
  await t.throws(() => list('identities'), Error, 'Cannot read directory identities')
})
