const { resolve } = require('../resolve')
const { create } = require('../create')
const { revoke } = require('../revoke')
const context = require('ara-context')()
const bip39 = require('bip39')
const util = require('../util')
const test = require('ava')

test('revoke() invalid opts', async (t) => {
  t.plan(9)
  const mnemonic = bip39.generateMnemonic()

  await t.throws(
    revoke(),
    TypeError,
    'Expecting opts to be an object.'
  )

  await t.throws(
    revoke({ }),
    TypeError,
    'Expecting web3 context object.'
  )

  await t.throws(
    revoke({ context: 'web3' }),
    TypeError,
    'Expecting web3 context object.'
  )

  await t.throws(
    revoke({ context }),
    TypeError,
    'Expecting mnemonic for revoking.'
  )

  await t.throws(
    revoke({ context, mnemonic: 1234 }),
    TypeError,
    'Expecting mnemonic to be a string.'
  )

  await t.throws(
    revoke({ context, mnemonic }),
    TypeError, 'Expecting password.'
  )

  await t.throws(
    revoke({ context, mnemonic: 'hello' }),
    TypeError,
    'Expecting a valid bip39 mnemonic for revoking.'
  )

  await t.throws(
    revoke({ context, mnemonic, password: 1234 }),
    TypeError,
    'Expecting password to be a string.'
  )

  await t.throws(
    revoke({ context, mnemonic, password: 'test' }),
    Error,
    'Could not resolve DID for the provided mnemonic'
  )
})

test('revoke(opts)', async (t) => {
  t.plan(1)

  const identity = await create({ context, password: 'test' })
  await util.writeIdentity(identity)
  const { mnemonic } = identity
  const revokedIdentity = await revoke({ context, password: 'test2', mnemonic })
  await util.writeIdentity(revokedIdentity)

  let ddo
  try {
    ddo = await resolve(revokedIdentity.publicKey.toString('hex'))
  } catch (err) {
    throw new Error('Could not resolve DID for the provided mnemonic')
  }

  t.true('string' === typeof ddo.revoked)
})
