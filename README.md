<img align="right" src="https://github.com/AraBlocks/docs/blob/master/ara.png" width="90" height="90" />

# ara-identity

[![Build Status](https://travis-ci.com/AraBlocks/ara-identity.svg?token=Ty4yTmKT8aELetQd1xZp&branch=master)](https://travis-ci.com/AraBlocks/ara-identity)

Ara Identity is an implementation of [Decentralized Identifiers](https://w3c-ccg.github.io/did-spec/) which allows users to interact with services in the Ara network. It provides the users with an ability to access the services running on the Ara network. To learn more about Ara, please visit our project [site](https://ara.one/)

## Table of Contents
* [Status](#status)
* [Stability](#stability)
* [Installation](#installation)
* [Setup](#setup)
* [Usage](#usage)
* [CLI](#cli)
* [Javascript API](#api)
* [For Developers](#for-developers)

## Status

This project is still in active development.

## Stability

> [Stability][stability-index]: 1 - Experimental. This feature is still under
> active development and subject to non-backwards compatible changes, or even
> removal, in any future version. Use of the feature is not recommended
> in production environments. Experimental features are not subject to
> the Node.js Semantic Versioning model.

## Installation

```sh
$ npm install arablocks/ara-identity
```

## Setup

```sh
$ git clone git@github.com:AraBlocks/ara-identity.git
$ cd ara-identity
$ npm install && npm link
$ aid --help
usage: aid [-hDV] <command> [options]

Commands:
  aid create                      Create an identity
  aid archive [did]               Archive identity in network
  aid resolve [did]               Resolve an identity
  aid list                        Output local identities
  aid whoami                      Output current Ara identity in context (.ararc)
  aid recover                     Recover an Ara identity using a mnemonic
  aid keystore-dump [did] [type]  Recover a private ethereum|ara key.

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version
```

## Usage

```js
const aid = require('ara-identity')
const context = require('ara-context') // Required for web3 interactions

// Creating an Ara ID
const identity = aid.create({context, password: 'hello'})

// Archiving an Ara ID
// Learn more about archiving and archiverOpts below under Ara references
await aid.archive(identity, archiverOpts)

// Resolving an Ara ID to get  DID-document
// Learn more about resolving and resolverOpts below under Ara references
const ddo = aid.resolver(aid.identifier, resolverOpts)

// Recovering a lost Ara ID using your bip39 mnemonic
const identity = aid.recover({mnemonic: 'hello silver ......', password: 'qwerty'})
```

### Ara References
* [archiving][archiver-readme]
* [resolving][resolver-readme]

## CLI

### aid create
Create an Ara ID through the command line. Prompts the user to enter a password for encryption

```sh
$ aid create -h
usage: aid create [-D] [options]

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version

$ aid create
? Your identitys keystore will be secured by a passphrase.
Please provide a passphrase. Do not forget this as it will never be shown to you.
Passphrase: [hidden]

 ara: info:  New identity created: did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45
 ara: warn:  Will write identity file: ddo.json
 ara: warn:  Will write identity file: keystore/eth
 ara: warn:  Will write identity file: keystore/ara
 ara: warn:  Will write identity file: schema.proto
 ara: warn:  Will write identity file: identity
 ara: info:  Please safely store the following 12 word mnemonic phrase for this
 ara: info:  Ara ID. This phrase will be required to restore your Ara ID.
 ara: info:  It will never be shown again:
 ara: info:

╔════════════════════════════════════════════════════════════════════════════╗
║ glad kangaroo coyote rich detail grief matrix spirit jeans owner heart net ║
╚════════════════════════════════════════════════════════════════════════════╝

```

### aid archive
Archive an Ara ID to a remote server from the command line. Prompts the user to enter their password for verification

```
$ aid archive -h
usage: aid archive [-D] [options]

Positionals:
  did  [default: ]

Network Options:
  --secret, -s   Shared secret key for the associated network keys  [required]
  --keyring, -k  Path to Ara network keyring file  [required]
  --network, -n  Human readable network name for keys in keyring  [required]

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version
$ aid archive did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45 \
              -s test-secret \
              -n archiver \
              -k /home/ubuntu/.ara/keyrings/test-keyring.pub

? Please provide a passphrase for your identity. This is needed to archive your identity.
Passphrase: [hidden]
 ara: warn:  Archiving new identity for network /home/ubuntu/.ara/keyrings/test-keyring.pub.
 ara: info:  Got hello from archiver node: key=35e2e3ec mac=5d8c8995
 ara: info:  Authenticated with archiver node: keys=c9e1b5f4 signature=dbb8c339
 ara: info:  Got okay from archiver node: signature=dbb8c339
 ara: info:  1 connection made
 ara: info:  Successfully archived identity to network archiver
```

### aid resolve
Resolves an Ara ID to its DID document either locally or from a remote server

```
$ aid resolver -h
usage: aid resolve [-D] [options]

Positionals:
  did  [default: ""]

Network Options:
  --secret, -s   Shared secret key for the associated network keys.
  --keyring, -k  Path to Ara network keyring file
  --network, -n  Human readable network name for keys in keyring

Resolution Options:
  --cache, -C    Enable or disable cache  [boolean] [default: true]
  --timeout, -t  Resolution timeout

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version

$ aid resolve 4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45 \
              -s test-secret \
              -n resolver \
              -k /home/ubuntu/.ara/keyrings/test-keyring.pub
```

## API
All functions exported by this module will check for input correctness. If given an invalid input, a function will throw a `TypeError` with the error message.

* [aid.archive(identity, opts)](#archive)
* [aid.create({context, password})](#create)
* [aid.createIdentityKeyPath(identity)](#createIdPath)
* [aid.did.create(publicKey)](#didCreate)
* [aid.did.getIdentifier(didURI)](#didGetIdentifier)
* [aid.did.normalize(identifier, method)](#didNormalize)
* [aid.ddo.create()](#ddoCreate)
* [aid.fs.writeFile()](#fsWriteFile)
* [aid.fs.readFile()](#fsReadFile)
* [aid.fs.readdir()](#fsReaddir)
* [aid.fs.access()](#fsAccess)
* [aid.fs.lstat()](#fsLstat)
* [aid.fs.stat()](#fsStat)
* [aid.list()](#list)
* [aid.recover()](#recover)
* [aid.replicate()](#replicate)
* [aid.resolve()](#resolve)
* [aid.util.ethHexToBuffer()](#utilHexToBuffer)
* [aid.util.toBuffer()](#utilToBuffer)
* [aid.util.toHex()](#utilToHex)
* [aid.util.writeIdentity()](#utilWriteIdentity)

<a name="archive"></a>
### `aid.archive(identity, opts)`
Archives an Ara ID into the Ara network where `identity` is the Ara Identity object created using `create()` method
```js
// Learn more about archive() opts here:
// https://github.com/AraBlocks/ara-network-node-identity-archiver/blob/master/README.md
const context = require('ara-context')
const opts = {
  secret: 'test-secret',
  network: 'test',
  keyring: '/home/ubuntu/.ara/keyrings/keyring.pub'
}
const identity = await aid.create({context, password: 'hello'})
await aid.archive(identity, opts)
```

<a name="create"></a>
### `aid.create({context, password})`
Creates an Ara identity encrypted using the provided `password`
```js
//Used for web3 interactions
//Learn more about ara-context here : https://github.com/arablocks/ara-context
const context = require('ara-context')
const password = 'hello'

const identity = await aid.create({context, password})
```

<a name="createIdPath"></a>
### `aid.createIdentityKeyPath(identity)`
Generate and retrieve the path to files of an identity stored locally
```js
const identity = await aid.create({context, password})
const path = aid.createIdentityKeyPath(identity)
```

<a name="didCreate"></a>
### `aid.did.create(publicKey)`
Creates a DID reference document from a given publicKey of a key pair
```js
const { publicKey, secretKey } = crypto.keyPair(seed)
const didUri = did.create(publicKey)
```

<a name="didGetIdentifier"></a>
### `aid.did.getIdentifier()`
Retrieve the identifier from a DID URI
```js
const did = 'did:ara:8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'

const identifier = aid.did.getIdentifier(didURI)
console.log(identifier) // '8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'
```

<a name="didNormalize"></a>
### `aid.did.normalize()`
Recreate an DID URI from an identifier & method where `method` is the DID method
```js
const identifier = '8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'
const method = 'ara'

const didURI = aid.did.normalize(identifier, method)
console.log(didURI) // 'did:ara:8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'
```

<a name="ddoCreate"></a>
### `aid.ddo.create()`
Creates a DID document for a given DID URI. See [did-spec][did-document] for more details on DID documents
```js
const { publicKey, secretKey } = crypto.keyPair(seed)
const didUri = did.create(publicKey)

const didDocument = ddo.create({ id: didUri })
```

<a name="fsWriteFile"></a>
### `aid.fs.writeFile()`

TODO

<a name="fsReadFile"></a>
### `aid.fs.readFile()`

TODO

<a name="fsReaddir"></a>
### `aid.fs.readdir()`

TODO

<a name="fsAccess"></a>
### `aid.fs.access()`

TODO

<a name="fsLstat"></a>
### `aid.fs.lstat()`

TODO

<a name="fsStat"></a>
### `aid.fs.stat()`

TODO

<a name="list"></a>
### `aid.list()`
Returns a list all identities present locally in a given path. Defaults to the root path if no path is provided
```js
const identities = await list()
console.log(identities) // Displays an Array of identity strings
```

<a name="recover"></a>
### `aid.recover({mnemonic})`
Recover a lost Ara identity by providing a valid bip39 mnemonic returned during creation
```js
const context = require('ara-context')
const password = 'test'

const mnemonic = 'soda inmate audit purpose logic raise put weasel child major cupboard daring'
const identity = await aid.recover({context, password, mnemonic})
```

<a name="replicate"></a>
### `aid.replicate()`
Replicates all identity files of a given Ara ID from a remote server(archiver/resolver). Make sure your `.ararc` file contains entries to the DNS & DHT server of the remote node
```js
const did = 'did:ara:8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'
const identity = await aid.replicate(did)
```

<a name="resolve"></a>
### `aid.resolve()`
Returns the DID document of an Ara ID either from a local copy or from a remote server
```js
// Learn more about resolve() opts here:
// https://github.com/AraBlocks/ara-network-node-identity-resolver/blob/master/README.md
const did = 'did:ara:8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'
const opts = {
  secret: 'test-secret',
  network: 'resolver',
  keyring: '/home/ubuntu/.ara/keyrings/keyring.pub'
}
const ddo = await aid.resolve(did, opts)
console.log(ddo) // Displays the DID document in JSON format
```

<a name="utilHexToBuffer"></a>
### `aid.util.ethHexToBuffer()`
Converts an ethereum style hex string into a buffer
```js
const hex = '8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'
const hexBuffer = aid.util.ethHexToBuffer(hex)
```

<a name="utilToBuffer"></a>
### `aid.util.toBuffer()`
Converts any provided value to a buffer
```js
const value = 1234
const buffer = aid.util.toBuffer(value)
```

<a name="utilToHex"></a>
### `aid.util.toHex()`
Converts a buffer to a hex string.
```js
const buffer = Buffer.from('hello')
const hex = aid.util.toHex(buffer)
```

<a name="utilWriteIdentity"></a>
### `aid.util.writeIdentity()`
Writes given ARA Identity files to the Ara root folder
```js
const context = require('ara-context')
const password = 'hello'

const identity = await aid.create({context, password})

await writeIdentity(identity)
```

## For Developers
To Contribute to Ara Identity, please look into our latest [issues](https://github.com/AraBlocks/ara-identity/issues) and also make sure to follow the below listed standards,
- [Commit message format](/.github/COMMIT_FORMAT.md)
- [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)
- [How to contribute](/.github/CONTRIBUTING.md)
- [Release Versioning guidelines](https://semver.org/)

## References
- [W3C Decentralized IDs specs](https://w3c-ccg.github.io/did-spec/)

## License

LGPL-3.0

[did-document]: https://w3c-ccg.github.io/did-spec/#did-documents
[stability-index]: https://nodejs.org/api/documentation.html#documentation_stability_index
[archiver-readme]: https://github.com/AraBlocks/ara-network-node-identity-archiver/blob/master/README.md
[resolver-readme]: https://github.com/AraBlocks/ara-network-node-identity-resolver/blob/master/README.md
