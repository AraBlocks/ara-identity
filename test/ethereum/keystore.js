const { toBuffer } = require('../../util')
const isBuffer = require('is-buffer')
const keystore = require('../../ethereum/keystore')
const wallet = require('../../ethereum/wallet')
const crypto = require('ara-crypto')
const test = require('ava')
const bip39 = require('bip39')

test('create(opts)', async (t) => {
  t.true('function' === typeof keystore.create)
  const ks = await keystore.create()
  // sanity checks
  t.true('object' === typeof ks)
  t.true(isBuffer(ks.iv))
  t.true(isBuffer(ks.privateKey))
  t.true(isBuffer(ks.salt))
})

test('dump(opts)', async (t) => {
  let seed = bip39.mnemonicToSeed(bip39.generateMnemonic())
  seed = crypto.blake2b(seed)
  const wal = await wallet.load({ seed })
  const ks = await keystore.create()
  const ko = await keystore.dump({
    password: 'test',
    privateKey: wal.getPrivateKey(),
    salt: ks.salt,
    iv: ks.iv
  })

  t.true('object' === typeof ko)
  t.true(0 === Buffer.compare(toBuffer(ko.crypto.cipherparams.iv), toBuffer(ks.iv)))
  t.true(0 === Buffer.compare(toBuffer(ko.crypto.kdfparams.salt), toBuffer(ks.salt)))
})
