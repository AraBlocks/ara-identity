const { toBuffer } = require('../../util')
const { create } = require('../../create')
const context = require('ara-context')()
const isBuffer = require('is-buffer')
const { toHex } = require('../../util')
const { resolve } = require('path')
const fs = require('fs')
const pify = require('pify')
const crypto = require('ara-crypto')
const keystore = require('../../ethereum/keystore')
const wallet = require('../../ethereum/wallet')
const test = require('ava')
const rc = require('../../rc')()




test('recover(opts)', async (t) => {
  const did = 'did:ara:fc4d5bcb20dcfb9dc0c319327246cd2a78d620d5de07fac43ff480a1381796ad'
  const mnemonic = 'delay blanket scene cactus rare bicycle embark wheel swallow laptop predict moral'
  const password = 'pressi123'
  const hash = toHex(crypto.blake2b(Buffer.from('fc4d5bcb20dcfb9dc0c319327246cd2a78d620d5de07fac43ff480a1381796ad', 'hex')))
  const path = resolve(rc.network.identity.root, hash)
  const keys = await pify(fs.readFile)(resolve(path, 'keystore/ara'), 'utf8')
  const encryptedKS = await pify(fs.readFile)(resolve(path, 'keystore/eth'), 'utf8')
  const privateKey = await keystore.recover(password, keys, encryptedKS)
  console.log("PK1 :",privateKey.toString('hex'))
  console.log("ID1 :",did)
})

test('recover(opts) testing if same pk is generated', async (t) => {
  const mnemonic = 'delay blanket scene cactus rare bicycle embark wheel swallow laptop predict moral'
  const password = 'pressi123'
  const identity = await create({context, mnemonic, password})
  const files = identity.files
  let keys
  let encryptedKS
  files.forEach((file) => {
    if (file.path === 'keystore/eth') {
      encryptedKS = file.buffer.toString('utf8')
    }
    if (file.path === 'keystore/ara') {
      keys = file.buffer.toString('utf8')
    }
  })
  const privateKey = await keystore.recover(password, keys, encryptedKS)
  console.log("PK2 :",privateKey.toString('hex'))
  console.log("ID2 :",JSON.stringify(identity.did))
})
