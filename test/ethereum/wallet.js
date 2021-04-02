const crypto = require('ara-crypto')
const bip39 = require('bip39')
const test = require('ava')
const { load } = require('../../ethereum/wallet')

test('ethereum.wallet.load(opts)', async (t) => {
  await t.throwsAsync(load(), { instanceOf: TypeError })
  await t.throwsAsync(load(null), { instanceOf: TypeError })
  await t.throwsAsync(load(0), { instanceOf: TypeError })
  await t.throwsAsync(load(true), { instanceOf: TypeError })
  await t.throwsAsync(load(NaN), { instanceOf: TypeError })
  await t.throwsAsync(load({}), { instanceOf: TypeError })

  let seed = await bip39.mnemonicToSeed(bip39.generateMnemonic())
  seed = crypto.blake2b(seed)
  t.true(null != load({ seed }))
})
