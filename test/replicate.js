const { replicate } = require('../replicate')
const test = require('ava')

test('replicate() invalid opts', async (t) => {
  await t.throws(replicate({}, {}), TypeError, 'Expecting a valid identity string to replicate.')
  await t.throws(replicate('abcd12345', {}), TypeError, 'Invalid DID identifier length.')
  const id = '488651f5767e73cc426b2eeb5d7e1e6e54a473e4394ab8a6417391986dd1bf8d'
  await t.throws(replicate(id, {}), TypeError, 'Expecting opts to be an object.')
  await t.throws(replicate(id, { secret: '' }), TypeError, 'Expecting shared secret to be a string or buffer.')
  await t.throws(replicate(id, { secret: 'hello' }), TypeError, 'Expecting network keyring file path.')
  await t.throws(replicate(id, { secret: 'hello', keyring: 'test_file.pub' }), TypeError, 'Expecting network name for replication.')
  await t.throws(replicate(id, { secret: 'hello', keyring: 'test_file.pub', network: 'test' }), TypeError, 'Could not replicate DID from peer. Request Timed out')
})
