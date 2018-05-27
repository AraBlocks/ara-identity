'use strict'

const { createCFS } = require('cfsnet/create')
const { keyPair } = require('./key-pair')
const archiver = require('./archiver')
const ethereum = require('./ethereum')
const protobuf = require('./protobuf')
const crypto = require('ara-crypto')
const pify = require('pify')
const ddo = require('./ddo')
const did = require('./did')
const ram = require('random-access-memory')

/**
 * Creates a new ARA identity.
 * @public
 * @param {Object} opts
 * @return {Object}
 * @throws TypeError
 */
async function create(opts) {
  if (null == opts || 'object' != typeof opts) {
    throw new TypeError("ara-identity.create: Expecting object.")
  }

  if (null == opts.context || 'object' != typeof opts.context) {
    throw new TypeError("ara-identity.create: Expecting context object.")
  }

  if (null == opts.context.web3 || 'object' != typeof opts.context.web3) {
    throw new TypeError("ara-identity.create: Expecting web3 to be in context.")
  }

  if (null == opts.password) {
    throw new TypeError("ara-identity.create: Expecting password.")
  } else if (opts.password && 'string' != typeof opts.password) {
    throw new TypeError("ara-identity.create: Expecting password to be a string.")
  }

  const { context, password } = opts
  const { web3 } = context
  const { publicKey, secretKey } = keyPair()

  const { salt, iv } = await ethereum.keystore.create()
  const account = await ethereum.account.create({web3})
  const wallet = await ethereum.wallet.load({account})
  const kstore = await ethereum.keystore.dump({
    password, salt, iv,
    privateKey: wallet.getPrivateKey(),
  })

  const didUri = did.create(publicKey)
  const didDocument = ddo.create({id: didUri})

  const cfs = await createCFS({
    secretKey: secretKey,
    storage: ram,
    key: publicKey,
    id: didUri.identifier,
  })

  const encryptionIV = crypto.randomBytes(16)
  const encryptionKey = secretKey.slice(0, 16)
  const encodedKeystore = protobuf.messages.KeyStore.encode(kstore)
  const encryptedKeystore = crypto.encrypt(encodedKeystore, {
    key: encryptionKey,
    iv: encryptionIV,
  })

  const files = {
    'ddo.json': JSON.stringify(didDocument),
    'keystore': JSON.stringify(encryptedKeystore)
  }

  const dec = crypto.decrypt(encryptedKeystore, {
    key: encryptionKey,
    iv: encryptionIV,
  })

  for (const k in files) {
    await cfs.writeFile(k, files[k])
  }

  encryptionIV.fill(0)
  encryptionKey.fill(0)

  if (opts.archive) {
    await archiver.archive({cfs}, opts.archive)
  }

  return {
    publicKey, secretKey, account, wallet, cfs,
    ddo: didDocument,
    did: didUri,
  }
}

module.exports = {
  create
}
