const context = require('ara-context')()
const bip39 = require('bip39')
const test = require('ava')

const { recover } = require('../recover')
const { create } = require('../create')

test('recover() invalid opts', async (t) => {
  await t.throwsAsync(
    recover(),
    { instanceOf: TypeError },
    'Expecting opts to be an object.'
  )

  await t.throwsAsync(
    recover({ context }),
    { instanceOf: TypeError },
    'Expecting password for recovery.'
  )

  await t.throwsAsync(
    recover({ context, password: 123 }),
    { instanceOf: TypeError },
    'Expecting mnemonic for recovery.'
  )

  await t.throwsAsync(
    recover({ context, password: 123, mnemonic: 1234 }),
    { instanceOf: TypeError },
    'Expecting mnemonic to be a string.'
  )

  await t.throwsAsync(
    recover({ context, password: 123, mnemonic: 'hello how' }),
    { instanceOf: TypeError },
    'Expecting a valid bip39 mnemonic for recovery.'
  )
})

test('recover() using valid mnemonic', async (t) => {
  const mnemonic = bip39.generateMnemonic()
  const identity = await recover({ context, password: 'password', mnemonic })
  t.true('object' === typeof identity)
  t.true(mnemonic === identity.mnemonic)
})

test('recover() compare recovered identity', async (t) => {
  const identity = await create({ context, password: '123' })
  // eslint-disable-next-line prefer-destructuring
  const mnemonic = identity.mnemonic
  const recoveredID = await recover({ context, password: 'hello', mnemonic })
  t.true(identity.account.privateKey === recoveredID.account.privateKey)
  t.true(identity.mnemonic === recoveredID.mnemonic)
  t.true(0 === Buffer.compare(identity.publicKey, recoveredID.publicKey))
  t.true(0 === Buffer.compare(identity.secretKey, recoveredID.secretKey))

  t.true(0 === Buffer.compare(
    identity.wallet.getPrivateKey(),
    recoveredID.wallet.getPrivateKey()
  ))

  t.true(0 === Buffer.compare(
    identity.wallet.getPublicKey(),
    recoveredID.wallet.getPublicKey()
  ))
})
