const keystore = require('../../ethereum/keystore')
const { create } = require('../../create')
const context = require('ara-context')()
const test = require('ava')

test('recover(opts)', async (t) => {
  t.plan(3)

  const mnemonic1 = 'delay blanket scene cactus rare bicycle embark wheel swallow laptop predict moral'
  const password1 = 'hello123'
  const identity1 = await create({ context, mnemonic: mnemonic1, password: password1 })
  const files1 = identity1.files
  let keys
  let encryptedKS
  files1.forEach((file) => {
    if ('keystore/eth' === file.path) {
      encryptedKS = file.buffer.toString('utf8')
    }
    if ('keystore/ara' === file.path) {
      keys = file.buffer.toString('utf8')
    }
  })
  const privateKey1 = await keystore.recover(password1, keys, encryptedKS)
  t.true(0 === Buffer.compare(identity1.account.privateKey, privateKey1))

  const mnemonic2 = 'delay blanket scene cactus rare bicycle embark wheel swallow laptop predict moral'
  const password2 = 'hello23456'
  const identity2 = await create({ context, mnemonic: mnemonic2, password: password2 })
  const files2 = identity2.files // eslint-disable-line prefer-destructuring
  files2.forEach((file) => {
    if ('keystore/eth' === file.path) {
      encryptedKS = file.buffer.toString('utf8')
    }
    if ('keystore/ara' === file.path) {
      keys = file.buffer.toString('utf8')
    }
  })
  const privateKey2 = await keystore.recover(password2, keys, encryptedKS)
  t.true(0 === Buffer.compare(identity2.account.privateKey, privateKey2))

  t.true(0 === Buffer.compare(privateKey1, privateKey2))
})
