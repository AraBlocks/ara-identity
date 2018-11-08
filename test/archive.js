const { archive } = require('../archive')
const { create } = require('../create')
const context = require('ara-context')()
const test = require('ava')

test('archive() Invalid opts', async (t) => {
  const identity = await create({ context, password: 'password' })

  await t.throws(archive(), TypeError, 'Expecting identity to be an object.')
  await t.throws(archive(identity), TypeError, 'Expecting options to be an object.')
  await t.throws(archive(identity, {}), TypeError, 'Shared secret cannot be empty.')
  await t.throws(archive(identity, { secret: 1234 }), TypeError, 'Expecting shared secret to be a string or buffer.')
  await t.throws(archive(identity, { secret: 'test-node', keyring: './fixtures/.pub' }), TypeError, 'Expecting network name for the archiver.')
  await t.throws(archive(identity, { secret: 'test-node', keyring: './fixtures/.pub', network: 'archiver' }), Error, 'Archiver request timed out.')
})
