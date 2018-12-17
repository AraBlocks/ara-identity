/* eslint-disable prefer-destructuring */
const { Authentication } = require('did-document')
const { PublicKey } = require('did-document/public-key')
const { Service } = require('did-document/service')
const createContext = require('ara-context')
const { toHex } = require('./util')
const isBuffer = require('is-buffer')
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

  if (opts.ddo) {
    if (!opts.ddo.publicKey && opts.ddo.publicKeys) {
      opts.ddo.publicKey = opts.ddo.publicKeys
    }

    if (opts.ddo.publicKey && !Array.isArray(opts.ddo.publicKey)) {
      opts.ddo.publicKey = [ opts.ddo.publicKey ]
    }
  }

  const { context = createContext({ provider: false }) } = opts
  const password = crypto.blake2b(Buffer.from(opts.password))

  let encryptedEthKeystore = null
  let encryptionKey = null
  let didDocument = null
  let publicKey = null
  let secretKey = null
  let account = null
  let wallet = null
  let didUri = null
  let seed = isBuffer(opts.seed) ? opts.seed : null

  if (isBuffer(opts.publicKey) && isBuffer(opts.secretKey)) {
    await modifyIdentity()
  } else {
    await createNewIdentity()
  }

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
        let { publicKeyBase64, publicKeyBase58 } = pk
        const { publicKeyHex } = pk

        if (!pk.id.startsWith('did:')) {
          pk.id = `${didUri.did}#${pk.id}`
        }

        const pub = Buffer.from(publicKeyHex, 'hex')

        if (!publicKeyBase58) {
          publicKeyBase58 = crypto.base64.encode(pub).toString()
        }

        if (!publicKeyBase64) {
          publicKeyBase64 = crypto.base64.encode(pub).toString()
        }

        didDocument.addPublicKey(new PublicKey({
          id: pk.id,
          type: pk.type || kEd25519VerificationKey2018,
          owner: didUri.did,

          // public key variants
          publicKeyHex,
          publicKeyBase58,
          publicKeyBase64,
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
  didDocument.update()
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
    buffer: Buffer.from(JSON.stringify(encryptedEthKeystore))
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

  if (null !== encryptionKey) {
    encryptionKey.fill(0)
    encryptionKey = null
  }

  if (null !== seed) {
    seed.fill(0)
    seed = null
  }

  if (context) {
    context.close()
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

  async function createNewIdentity() {
    if (opts.context && 'object' !== typeof opts.context.web3) {
      throw new TypeError('Expecting web3 to be in context.')
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

    if (isBuffer(opts.seed)) {
      seed = opts.seed
    } else {
      seed = crypto.blake2b(bip39.mnemonicToSeed(mnemonic))
    }

    const kp = crypto.keyPair(seed)
    publicKey = kp.publicKey
    secretKey = kp.secretKey

    const { web3 } = context
    const { salt, iv } = await ethereum.keystore.create()

    encryptionKey = createEncryptionKey()

    wallet = await ethereum.wallet.load({
      seed: bip39.mnemonicToSeed(mnemonic)
    })

    account = await ethereum.account.create({
      web3,
      privateKey: wallet.getPrivateKey()
    })

    const kstore = await ethereum.keystore.dump({
      password: opts.password,
      salt,
      iv,
      privateKey: wallet.getPrivateKey(),
    })

    const encodedKeystore = protobuf.messages.KeyStore.encode(kstore)
    encryptedEthKeystore = ss.encrypt(encodedKeystore, {
      key: encryptionKey,
      iv: crypto.randomBytes(16),
    })

    didUri = did.create(publicKey)
    didDocument = createDIDDocument()

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
  }

  async function modifyIdentity() {
    publicKey = opts.publicKey
    secretKey = opts.secretKey
    encryptionKey = createEncryptionKey()
    didUri = did.create(publicKey)
    didDocument = createDIDDocument()
  }

  function createEncryptionKey() {
    return Buffer.allocUnsafe(16).fill(secretKey.slice(0, 16))
  }

  function createDIDDocument() {
    const conf = { id: didUri }

    // opts is DDO
    if ('id' in opts && 'publicKey' in opts) {
      conf.created = opts.created
      conf.updated = opts.updated
      conf.revoked = opts.revoked
    } else if (opts.ddo) {
      conf.created = opts.ddo.created
      conf.updated = opts.ddo.updated
      conf.revoked = opts.ddo.revoked
    }

    return ddo.create(conf)
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
