'use strict'

const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')
const { PublicKey } = require('did-document/public-key')
const { createCFS } = require('cfsnet/create')
const { archive } = require('./archive')
const { keyPair } = require('./key-pair')
const { toHex } = require('./util')
const ethereum = require('./ethereum')
const protobuf = require('./protobuf')
const crypto = require('ara-crypto')
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

  const { salt, iv } = await ethereum.keystore.create()
  const account = await ethereum.account.create({web3})
  const wallet = await ethereum.wallet.load({account})
  const kstore = await ethereum.keystore.dump({
    password, salt, iv,
    privateKey: wallet.getPrivateKey(),
  })

  const { publicKey, secretKey } = keyPair(wallet.getPrivateKey())

  const didUri = did.create(publicKey)
  const didDocument = ddo.create({id: didUri})

  const cfs = await createCFS({
    secretKey: secretKey,
    storage: ram,
    key: publicKey,
    id: toHex(publicKey),
  })

  const encryptionIV = crypto.randomBytes(16)
  const encryptionKey = secretKey.slice(0, 16)
  const encodedKeystore = protobuf.messages.KeyStore.encode(kstore)
  const encryptedKeystore = crypto.encrypt(encodedKeystore, {
    key: encryptionKey,
    iv: encryptionIV,
  })

  didDocument.addPublicKey(new PublicKey({
    id: didUri.did + '#keys-1',
    type: kEd25519VerificationKey2018,
    owner: didUri.did,

    // public key variants
    publicKeyHex: toHex(publicKey),
    publicKeyBase64: crypto.base64.encode(publicKey).toString(),
    publicKeyBase58: crypto.base58.encode(publicKey).toString(),
  }))

  didDocument.proof({
    // from ld-cryptosuite-registry'
    type: kEd25519VerificationKey2018,
    // ISO timestamp
    created: (new Date()).toISOString(),
    creator: didUri.did + '#keys-1',
    signature: toHex(crypto.sign(publicKey, secretKey))
  })

  const files = [{
    path: 'ddo.json',
    buffer: Buffer.from(JSON.stringify(didDocument))
  }, {
    path: 'keystore/eth',
    buffer: Buffer.from(JSON.stringify(encryptedKeystore))
  }]

  const buffer = protobuf.messages.Identity.encode({
    key: publicKey,
    files: files,
  })

  for (const file of files) {
    await cfs.writeFile(file.path, file.buffer)
  }

  encryptionIV.fill(0)
  encryptionKey.fill(0)

  if (opts.archive) {
    await archive({cfs}, opts.archive)
  }

  return {
    publicKey, secretKey, account, wallet, buffer, cfs,
    ddo: didDocument,
    did: didUri,
  }
}

module.exports = {
  create
}
