const { Authentication } = require('did-document')
const { PublicKey } = require('did-document/public-key')
const { Service } = require('did-document/service')
const { toHex } = require('./util')
const ethereum = require('./ethereum')
const protobuf = require('./protobuf')
const isBuffer = require('is-buffer')
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

  if (null == opts.context || 'object' !== typeof opts.context) {
    throw new TypeError('Expecting context object.')
  }

  if (null == opts.context.web3 || 'object' !== typeof opts.context.web3) {
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
    if (opts.ddo.publicKeys) {
      if (!opts.ddo.publicKey) {
        opts.ddo.publicKey = opts.ddo.publicKeys
      }
      else if (opts.ddo.publicKey && Array.isArray(opts.ddo.publicKey)) {
        for (const pk of opts.ddo.publicKey) {
          opts.ddo.publicKey.push(pk)
        }
      }
    }
  }

  const seed = crypto.blake2b(bip39.mnemonicToSeed(mnemonic))

  const { context } = opts
  const { web3 } = context
  const { publicKey, secretKey } = crypto.keyPair(seed)
  const password = crypto.blake2b(Buffer.from(opts.password))

  const { salt, iv } = await ethereum.keystore.create()
  const wallet = await ethereum.wallet.load({ seed })
  const account = await ethereum.account.create({
    web3,
    privateKey: wallet.getPrivateKey()
  })

  const kstore = await ethereum.keystore.dump({
    password,
    salt,
    iv,
    privateKey: wallet.getPrivateKey(),
  })

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

  didDocument.addPublicKey(createPublicKey({
    id: 'owner',
    did: didUri.did,
    type: kEd25519VerificationKey2018,
    value: publicKey
  }))

  didDocument.addPublicKey(createPublicKey({
    id: 'eth',
    did: didUri.did,
    type: kSecp256k1VerificationKey2018,
    value: wallet.getPublicKey()
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
        console.log(auth)
        didDocument.addAuthentication(new Authentication(
          auth.type,
          { publicKey: auth.publicKey }
        ))
      }
    }

    // additional keys
    if (Array.isArray(opts.ddo.publicKey)) {
      for (const pk of opts.ddo.publicKey) {
        if ('metdata' == pk.id) {
          pk.id = `${didUri.did}#${pk.id}`
        }
        if (pk.value) {
          if (!isBuffer(pk.value)) {
            // eslint-disable-next-line no-param-reassign
            pk.value = Buffer.from(pk.value, 'hex')
          }
          pk.publicKeyHex = toHex(pk.value)
          pk.publicKeyBase64 = crypto.base64.encode(opts.value).toString()
          pk.publicKeyBase58 = crypto.base58.encode(opts.value).toString()
        }
        didDocument.addPublicKey(pk)
      }
    }

    // add service endpoints
    if (Array.isArray(opts.ddo.service)) {
      for (const service of opts.ddo.service) {
        didDocument.addService(createService({
          id: `${didUri.did}#${service.id}`,
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
 * Creates a new public key to be added to the publicKey array.
 * @param  {Object} opts
 * @return {Object}
 */
function createPublicKey(opts = {}) {
  if (!isBuffer(opts.value)) {
    // eslint-disable-next-line no-param-reassign
    opts.value = Buffer.from(opts.value, 'hex')
  }

  return new PublicKey({
    id: `${opts.did}#${opts.id}`,
    type: opts.type,
    owner: opts.did,

    // public key variants
    publicKeyHex: toHex(opts.value),
    publicKeyBase64: crypto.base64.encode(opts.value).toString(),
    publicKeyBase58: crypto.base58.encode(opts.value).toString()
  })
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
