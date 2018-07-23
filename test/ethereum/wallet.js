const { load } = require('../../ethereum/wallet')
const crypto = require('ara-crypto')
const bip39 = require('bip39')
const test = require('ava')

test('ethereum.wallet.load(opts)', async (t) => {
  await t.throws(load(), TypeError)
  await t.throws(load(null), TypeError)
  await t.throws(load(0), TypeError)
  await t.throws(load(true), TypeError)
  await t.throws(load(NaN), TypeError)
  await t.throws(load({}), TypeError)

  let seed = bip39.mnemonicToSeed(bip39.generateMnemonic())
  seed = crypto.blake2b(seed)
  t.true(null != load({ seed }))
})
