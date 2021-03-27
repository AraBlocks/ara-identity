const { replicate } = require('../replicate')
const test = require('ava')

test('replicate() invalid opts', async (t) => {
  await t.throwsAsync(replicate({}, {}), {instanceOf: TypeError}, 'Expecting a valid identity string to replicate.')
  await t.throwsAsync(replicate('abcd12345', {}), {instanceOf: TypeError}, 'Invalid DID identifier length.')
  const id = '488651f5767e73cc426b2eeb5d7e1e6e54a473e4394ab8a6417391986dd1bf8d'
  await t.throwsAsync(replicate(id, {}), {instanceOf: Error}, 'Could not replicate DID from peer. Request Timed out')
})
