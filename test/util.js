const util = require('../util')
const test = require('ava')

test('util.listIdentity()', async (t) => {
  t.plan(3)
  const identities = await util.listIdentity()
  t.true(null !== identities)
  t.true('object' === typeof identities)
  await t.throws(() => util.listIdentity('prashanth'), TypeError, 'Specified folder does not exist')
})
