const test = require('ava')
const { entropy } = require('../../ethereum/entropy')

test('ethereum.entropy(size)', async (t) => {
  t.plan(6)
  await t.throwsAsync(() => entropy(1), { instanceOf: TypeError }, 'too small')
  await t.throwsAsync(() => entropy(1), { instanceOf: TypeError }, 'too small')
  await t.throwsAsync(() => entropy(-1), { instanceOf: TypeError }, 'too small')
  await t.throwsAsync(() => entropy(15), { instanceOf: TypeError }, 'too small')
  // minimum
  await t.true(32 === (await entropy(16)).length)
  // default
  await t.true(64 === (await entropy()).length)
})
