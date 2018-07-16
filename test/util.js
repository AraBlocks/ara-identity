const util = require('../util')
const test = require('ava')

test('util.listIdentity()', async (t) => {
  const identities = await util.listIdentity()
  console.log(identities)
  t.true(null != identities)
  t.true('object' === typeof identities)
})
