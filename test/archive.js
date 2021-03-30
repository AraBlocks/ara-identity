const context = require('ara-context')()
const test = require('ava')

const { archive } = require('../archive')
const { create } = require('../create')

test('archive() Invalid opts', async (t) => {
  const identity = await create({ context, password: 'password' })

  await t.throwsAsync(
    archive(),
    { instanceOf: TypeError },
    'Expecting identity to be an object.'
  )

  // TODO: Find a way to ignore $HOME/.ararc when runnnig locally
  // await t.throwsAsync(archive(identity), TypeError, 'Expecting options to be an object.')
  // await t.throwsAsync(archive(identity, {}), TypeError, 'Shared secret cannot be empty.')

  await t.throwsAsync(
    archive(identity, { secret: 1234 }),
    { instanceOf: TypeError },
    'Expecting shared secret to be a string or buffer.'
  )

  await t.throwsAsync(
    archive(identity, { secret: 'test-node', keyring: './fixtures/keyring.pub' }),
    { instanceOf: TypeError },
    'Expecting network name for the archiver.'
  )

  await t.throwsAsync(
    archive(identity, { secret: 'test-node', keyring: './fixtures/keyring.pub', network: 'archiver' }),
    { instanceOf: Error },
    'Archiver request timed out.'
  )
})
