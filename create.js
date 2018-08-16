const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')
const { PublicKey } = require('did-document/public-key')
const { Authentication } = require('did-document')
const ethereum = require('./ethereum')
const protobuf = require('./protobuf')
const isBuffer = require('is-buffer')
const crypto = require('ara-crypto')
const { toHex } = require('./util')
const bip39 = require('bip39')
const ddo = require('./ddo')
const did = require('./did')
const ss = require('ara-secret-storage')

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
    throw new TypeError('ara-identity.create: Expecting object.')
  }

  if (null == opts.context || 'object' !== typeof opts.context) {
    throw new TypeError('ara-identity.create: Expecting context object.')
  }

  if (null == opts.context.web3 || 'object' !== typeof opts.context.web3) {
    throw new TypeError('ara-identity.create: Expecting web3 to be in context.')
  }

  if (null == opts.password) {
    throw new TypeError('ara-identity.create: Expecting password.')
  } else if (opts.password && 'string' !== typeof opts.password) {
    throw new TypeError('ara-identity.create: Expecting password to be a string.')
  }

  if (opts.did) {
    if (opts.did.authentication && 'object' !== typeof opts.did.authentication) {
      throw new TypeError('ara-identity.create: Expecting authentication to be an object.')
    }
    if (opts.did.keys && !Array.isArray(opts.did.keys)) {
      throw new TypeError('ara-identity.create: Expecting additional publicKey to be an array.')
    }
  }

  if (null == opts.mnemonic) {
    mnemonic = bip39.generateMnemonic()
  } else {
    // eslint-disable-next-line prefer-destructuring
    mnemonic = opts.mnemonic
  }
  let seed = bip39.mnemonicToSeed(mnemonic)
  seed = crypto.blake2b(seed)

  const { context } = opts
  const { web3 } = context
  const { publicKey, secretKey } = crypto.keyPair(seed)
  const password = crypto.blake2b(Buffer.from(opts.password))

  const { salt, iv } = await ethereum.keystore.create()
  const wallet = await ethereum.wallet.load({ seed })
  const account = await ethereum.account.create({ web3, privateKey: wallet.getPrivateKey() })
  const kstore = await ethereum.keystore.dump({
    password,
    salt,
    iv,
    privateKey: wallet.getPrivateKey(),
  })

  const didUri = did.create(publicKey)
  const didDocument = ddo.create({ id: didUri })

  const encryptionKey = Buffer.allocUnsafe(16).fill(secretKey.slice(0, 16))
  const encodedKeystore = protobuf.messages.KeyStore.encode(kstore)
  const encryptedKeystore = ss.encrypt(encodedKeystore, {
    key: encryptionKey,
    iv: crypto.randomBytes(16),
  })

  didDocument.addPublicKey(_createPublicKey({
    did: didUri.did,
    id: 'owner',
    value: publicKey
  }))

  if (opts.did) {
    // add default authentication to ddo if available
    if (opts.did.authentication) {
      const { authenticationType, authenticationKey } = opts.did.authentication
      didDocument.addAuthentication(new Authentication(authenticationType, { authenticationKey }))
    }

    // additional keys
    if (opts.did.keys) {
      opts.did.keys.forEach(({ id, value }) => {
        didDocument.addPublicKey(_createPublicKey({
          did: didUri.did,
          id,
          value
        }))
      })
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

  /*
   * the intermediate value are the identity fields with
   * the proof field missing
   */
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
function _createPublicKey(opts = {}) {
  if (!isBuffer(opts.value)) {
    opts.value = Buffer.from(opts.value, 'hex')
  }
  return new PublicKey({
    id: `${opts.did}#${opts.id}`,
    type: kEd25519VerificationKey2018,
    owner: opts.did,

    // public key variants
    publicKeyHex: toHex(opts.value),
    publicKeyBase64: crypto.base64.encode(opts.value).toString(),
    publicKeyBase58: crypto.base58.encode(opts.value).toString()
  })
}

module.exports = {
  create
}
