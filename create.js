/* eslint-disable prefer-destructuring */
const { Authentication } = require('did-document')
const { PublicKey } = require('did-document/public-key')
const { Service } = require('did-document/service')
const createContext = require('ara-context')
const { toHex } = require('./util')
const ethereum = require('./ethereum')
const protobuf = require('./protobuf')
const crypto = require('ara-crypto')
const bip39 = require('bip39')
const ddo = require('./ddo')
const did = require('./did')
const ss = require('ara-secret-storage')

const {
  kEd25519VerificationKey2018,
  kEd25519SignatureAuthentication2018,

  kSecp256k1VerificationKey2018,
  kSecp256k1SignatureAuthentication2018,
} = require('ld-cryptosuite-registry')

/**
 * Creates a new ARA identity.
 * @public
 * @param {Object} opts
 * @return {Object}
 * @throws TypeError
 */
async function create(opts) {
  let mnemonic

  if (null == opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting object.')
  }

  if (opts.context && 'object' !== typeof opts.context) {
    throw new TypeError('Expecting context object.')
  }

  if (opts.context && 'object' !== typeof opts.context.web3) {
    throw new TypeError('Expecting web3 to be in context.')
  }

  if (null == opts.password) {
    throw new TypeError('Expecting password.')
  } else if (opts.password && 'string' !== typeof opts.password) {
    throw new TypeError('Expecting password to be a string.')
  }

  if (opts.ddo) {
    if (opts.ddo.authentication && 'object' !== typeof opts.ddo.authentication) {
      throw new TypeError('Expecting authentication to be an object.')
    }

    if (opts.ddo.publicKeys && !Array.isArray(opts.ddo.publicKeys)) {
      throw new TypeError('Expecting additional publicKey to be an array.')
    }

    if (opts.ddo.service && !Array.isArray(opts.ddo.service)) {
      throw new TypeError('Expecting service endpoints to be an array.')
    }
  }

  if (null == opts.mnemonic) {
    mnemonic = bip39.generateMnemonic()
  } else {
    if (!bip39.validateMnemonic(opts.mnemonic)) {
      throw new TypeError('Expecting a valid bip39 mnemonic')
    }
    // eslint-disable-next-line prefer-destructuring
    mnemonic = opts.mnemonic
  }

  if (opts.ddo) {
    if (!opts.ddo.publicKey && opts.ddo.publicKeys) {
      opts.ddo.publicKey = opts.ddo.publicKeys
    }

    if (opts.ddo.publicKey && !Array.isArray(opts.ddo.publicKey)) {
      opts.ddo.publicKey = [ opts.ddo.publicKey ]
    }
  }

  const { seed = crypto.blake2b(bip39.mnemonicToSeed(mnemonic)) } = opts
  const { context = createContext() } = opts
  const { web3 } = context
  const { publicKey, secretKey } = crypto.keyPair(seed)

  const { salt, iv } = await ethereum.keystore.create()
  const wallet = await ethereum.wallet.load({ seed: bip39.mnemonicToSeed(mnemonic) })
  const account = await ethereum.account.create({
    web3,
    privateKey: wallet.getPrivateKey()
  })

  console.log(account)

  const kstore = await ethereum.keystore.dump({
    password: opts.password,
    salt,
    iv,
    privateKey: wallet.getPrivateKey(),
  })

  const password = crypto.blake2b(Buffer.from(opts.password))

  const didUri = did.create(publicKey)
  let didDocument
  if (opts.revoked && opts.created) {
    const { created, revoked } = opts
    didDocument = ddo.create({ id: didUri, created, revoked })
  } else {
    didDocument = ddo.create({ id: didUri })
  }

  const encryptionKey = Buffer.allocUnsafe(16).fill(secretKey.slice(0, 16))
  const encodedKeystore = protobuf.messages.KeyStore.encode(kstore)
  const encryptedKeystore = ss.encrypt(encodedKeystore, {
    key: encryptionKey,
    iv: crypto.randomBytes(16),
  })

  didDocument.addPublicKey(new PublicKey({
    id: `${didUri.did}#owner`,
    type: kEd25519VerificationKey2018,
    owner: didUri.did,

    // public key variants
    publicKeyHex: toHex(publicKey),
    publicKeyBase64: crypto.base64.encode(publicKey).toString(),
    publicKeyBase58: crypto.base58.encode(publicKey).toString()
  }))

  didDocument.addPublicKey(new PublicKey({
    id: `${didUri.did}#eth`,
    type: kSecp256k1VerificationKey2018,
    owner: didUri.did,

    // public key variants
    publicKeyHex: toHex(wallet.getPublicKey()),
    publicKeyBase64: crypto.base64.encode(wallet.getPublicKey()).toString(),
    publicKeyBase58: crypto.base58.encode(wallet.getPublicKey()).toString()
  }))

  didDocument.addAuthentication(new Authentication(
    kEd25519SignatureAuthentication2018,
    { publicKey: `${didUri.did}#owner` }
  ))

  didDocument.addAuthentication(new Authentication(
    kSecp256k1SignatureAuthentication2018,
    { publicKey: `${didUri.did}#eth` }
  ))

  if (opts.ddo) {
    // add default authentication to ddo if available
    if (opts.ddo.authentication) {
      if (!Array.isArray(opts.ddo.authentication)) {
        // eslint-disable-next-line no-param-reassign
        opts.ddo.authentication = [ opts.ddo.authentication ]
      }

      for (const auth of opts.ddo.authentication) {
        // eslint-disable-next-line no-shadow
        didDocument.addAuthentication(new Authentication(
          auth.type,
          { publicKey: auth.publicKey }
        ))
      }
    }

    // additional keys
    if (Array.isArray(opts.ddo.publicKey)) {
      for (const pk of opts.ddo.publicKey) {
        const { publicKeyHex, publicKeyBase64, publicKeyBase58 } = pk
        if (!pk.id.startsWith('did:')) {
          pk.id = `${didUri.did}#${pk.id}`
        }
        didDocument.addPublicKey(new PublicKey({
          id: pk.id,
          type: pk.type || kEd25519VerificationKey2018,
          owner: didUri.did,

          // public key variants
          publicKeyHex,
          publicKeyBase64,
          publicKeyBase58
        }))
      }
    }

    // add service endpoints
    if (Array.isArray(opts.ddo.service)) {
      for (const service of opts.ddo.service) {
        if (!service.id.startsWith('did:')) {
          service.id = `${didUri.did}#${service.id}`
        }
        didDocument.addService(createService({
          id: service.id,
          type: service.type,
          serviceEndpoint: service.serviceEndpoint,
          service
        }))
      }
    }
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
    creator: `${didUri.did}#owner`,
    signatureValue: toHex(crypto.sign(digest, secretKey))
  })

  const files = [ {
    path: 'ddo.json',
    buffer: Buffer.from(JSON.stringify(didDocument))
  }, {
    path: 'keystore/eth',
    buffer: Buffer.from(JSON.stringify(encryptedKeystore))
  }, {
    path: 'keystore/ara',
    buffer: Buffer.from(JSON.stringify(ss.encrypt(secretKey, {
      iv: crypto.randomBytes(16),
      key: password.slice(0, 16)
    })))
  }, {
    path: 'schema.proto',
    buffer: protobuf.kProtocolBufferSchema,
  } ]

  // The intermediate value are the identity fields with
  // the proof field missing
  const intermediate = protobuf.messages.Identity.encode({
    did: didUri.did,
    key: publicKey,
    files,
  })

  files.push({
    path: 'identity',
    buffer: protobuf.messages.Identity.encode({
      did: didUri.did,
      key: publicKey,
      files,

      // sign intermediate to get identity signature
      proof: { signature: crypto.sign(intermediate, secretKey) }
    }),
  })

  encryptionKey.fill(0)
  seed.fill(0)

  if (web3 && web3.currentProvider && web3.currentProvider.connection) {
    context.web3.currentProvider.connection.close()
  }

  return {
    account,
    mnemonic,
    publicKey,
    secretKey,
    wallet,
    files,
    ddo: didDocument,
    did: didUri,
  }
}

/**
 * Creates a new service endpoint to be added to the service array.
 * @param {Object} opts
 * @return {Object}
 */
function createService(opts = {}) {
  const {
    id, type, serviceEndpoint, service
  } = opts
  return new Service(
    id,
    type,
    serviceEndpoint,
    service
  )
}

module.exports = {
  create
}
