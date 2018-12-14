const { Ed25519VerificationKey2018 } = require('ld-cryptosuite-registry')
const { PublicKey } = require('did-document/public-key')
const { update } = require('../update')
const { create } = require('../create')
const crypto = require('ara-crypto')
const test = require('ava')

test('update() valid ARA id', async (t) => {
  const password = 'password'
  const identity = await create({ password })

  t.true('object' === typeof identity)
  t.true(null !== identity.mnemonic)

  const keyPair = crypto.ed25519.keyPair()
  const publicKey = new PublicKey({
    id: `${identity.did.did}#public-key`,
    type: Ed25519VerificationKey2018,
    owner: identity.did.did,
    publicKeyHex: keyPair.publicKey.toString('hex')
  })

  identity.ddo.addPublicKey(publicKey)

  const updated = await update(identity.did.did, {
    password,
    publicKey: identity.publicKey,
    secretKey: identity.secretKey,
    ddo: identity.ddo
  })

  let added = false
  for (const pk of updated.ddo.publicKey) {
    if (pk.id === publicKey.id && pk.publicKeyHex === publicKey.publicKeyHex) {
      added = true
      break
    }
  }

  t.true(added, 'public key added to ddo and updated')
})
