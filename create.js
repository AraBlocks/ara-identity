'use strict'

const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')
const { PublicKey } = require('did-document/public-key')
const { normalize } = require('did-document/normalize')
const { Authentication } = require('did-document')
const { archive } = require('./archive')
const { toHex } = require('./util')
const ethereum = require('./ethereum')
const protobuf = require('./protobuf')
const crypto = require('ara-crypto')
const ddo = require('./ddo')
const did = require('./did')
const fs = require('fs')

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

  const { context } = opts
  const { web3 } = context
  const password = crypto.blake2b(Buffer.from(opts.password))
  const { salt, iv } = await ethereum.keystore.create()
  const account = await ethereum.account.create({web3})
  const wallet = await ethereum.wallet.load({account})
  const kstore = await ethereum.keystore.dump({ password, salt, iv,
    privateKey: wallet.getPrivateKey(),
  })

  const { publicKey, secretKey } = crypto.keyPair(password)

  const didUri = did.create(publicKey)
  const didDocument = ddo.create({id: didUri})

  const encryptionKey = Buffer.allocUnsafe(16).fill(secretKey.slice(0, 16))
  const encodedKeystore = protobuf.messages.KeyStore.encode(kstore)
  const encryptedKeystore = crypto.encrypt(encodedKeystore, {
    key: encryptionKey,
    iv: crypto.randomBytes(16),
  })

  didDocument.addPublicKey(new PublicKey({
    id: didUri.did + '#owner',
    type: kEd25519VerificationKey2018,
    owner: didUri.did,

    // public key variants
    publicKeyHex: toHex(publicKey),
    publicKeyBase64: crypto.base64.encode(publicKey).toString(),
    publicKeyBase58: crypto.base58.encode(publicKey).toString(),
  }))

  // add default authentication to ddo if available
  if (opts.did && opts.did.authentication) {
    const { type, publicKey } = opts.did.authentication
    didDocument.addAuthentication(new Authentication(type, { publicKey }))
  }

  // sign the DDO for the proof
  const digest = didDocument.digest(crypto.blake2b)
  didDocument.proof({
    // from ld-cryptosuite-registry'
    type: kEd25519VerificationKey2018,
    nonce: crypto.randomBytes(32).toString('hex'),
    domain: 'ara',
    // ISO timestamp
    created: (new Date()).toISOString(),
    creator: didUri.did + '#owner',
    signatureValue: toHex(crypto.sign(digest, secretKey))
  })

  const files = [{
    path: 'ddo.json',
    buffer: Buffer.from(JSON.stringify(didDocument))
  }, {
    path: 'keystore/eth',
    buffer: Buffer.from(JSON.stringify(encryptedKeystore))
  }]

  // the intermediate value are the identity fields with
  // the proof field missing
  const intermediate = protobuf.messages.Identity.encode({
    did: didUri.did,
    key: publicKey,
    files: files,
  })

  files.push({
    path: 'identity',
    buffer: protobuf.messages.Identity.encode({
      did: didUri.did,
      key: publicKey,
      files: files,

      // sign intermediate to get identity signature
      proof: { signature: crypto.sign(intermediate, secretKey) }
    }),
  })

  files.push({
    path: 'keys',
    buffer: Buffer.from(JSON.stringify(
      crypto.encrypt(secretKey, {
        iv: crypto.randomBytes(16),
        key: password.slice(0, 16)
      })
    ))
  })

  files.push({
    path: 'schema.proto',
    buffer: protobuf.kProtocolBufferSchema,
  })

  encryptionKey.fill(0)

  return {
    publicKey, secretKey, account, wallet, files,
    ddo: didDocument,
    did: didUri,
  }
}

module.exports = {
  create
}
