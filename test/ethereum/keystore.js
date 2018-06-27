const { toBuffer } = require('../../util')
const isBuffer = require('is-buffer')
const keystore = require('../../ethereum/keystore')
const account = require('../../ethereum/account')
const wallet = require('../../ethereum/wallet')
const test = require('ava')
const Web3 = require('web3')

const web3 = new Web3('http://127.0.0.1:9545')

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
  const acc = await account.create({ web3 })
  const wal = await wallet.load({ account: acc })
  const ks = await keystore.create()
  const ko = await keystore.dump({
    password: 'test',
    privateKey: wal.getPrivateKey(),
    salt: ks.salt,
    iv: ks.iv
  })

  t.true('object' === typeof ko)
  t.true(0 === Buffer.compare(toBuffer(acc.address), toBuffer(ko.address)))
  t.true(0 === Buffer.compare(toBuffer(ko.crypto.cipherparams.iv), toBuffer(ks.iv)))
  t.true(0 === Buffer.compare(toBuffer(ko.crypto.kdfparams.salt), toBuffer(ks.salt)))
})
