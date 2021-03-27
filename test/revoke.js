const { revoke } = require('../revoke')
const context = require('ara-context')()
const bip39 = require('bip39')
const test = require('ava')

test('revoke() invalid opts', async (t) => {
  t.plan(9)
  const mnemonic = bip39.generateMnemonic()

  await t.throwsAsync(
    revoke(),
    {instanceOf: TypeError},
    'Expecting opts to be an object.'
  )

  await t.throwsAsync(
    revoke({ }),
    {instanceOf: TypeError},
    'Expecting web3 context object.'
  )

  await t.throwsAsync(
    revoke({ context: 'web3' }),
    {instanceOf: TypeError},
    'Expecting web3 context object.'
  )

  await t.throwsAsync(
    revoke({ context }),
    {instanceOf: TypeError},
    'Expecting mnemonic for revoking.'
  )

  await t.throwsAsync(
    revoke({ context, mnemonic: 1234 }),
    {instanceOf: TypeError},
    'Expecting mnemonic to be a string.'
  )

  await t.throwsAsync(
    revoke({ context, mnemonic }),
    {instanceOf: TypeError}, 'Expecting password.'
  )

  await t.throwsAsync(
    revoke({ context, mnemonic: 'hello' }),
    {instanceOf: TypeError},
    'Expecting a valid bip39 mnemonic for revoking.'
  )

  await t.throwsAsync(
    revoke({ context, mnemonic, password: 1234 }),
    {instanceOf: TypeError},
    'Expecting password to be a string.'
  )

  await t.throwsAsync(
    revoke({ context, mnemonic, password: 'test' }),
    {instanceOf: Error},
    'Could not resolve DID for the provided mnemonic'
  )
})
