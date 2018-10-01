<img src="https://github.com/arablocks/ara-module-template/blob/master/ara.png" width="30" height="30" /> ara-identity
========

[![Build Status](https://travis-ci.com/AraBlocks/ara-identity.svg?token=Ty4yTmKT8aELetQd1xZp&branch=master)](https://travis-ci.com/AraBlocks/ara-identity)

Ara Identity is an implementation of [Decentralized Identifiers](https://w3c-ccg.github.io/did-spec/) which allows users to interact with services in the Ara network. To learn more about Ara network, please refer to the Ara white paper [here][ara-docs]

## Table of Contents
* [Status](#status)
* [Stability](#stability)
* [Installation](#installation)
* [Usage](#usage)
* [API](#api)
* [CLI](#cli)
* [Contributing](#contributing)
* [See Also](#see-also)

## Status

This project is in active development.

## Stability

> [Stability][stability-index]: 1 - Experimental. These features are still under
> active development and subject to non-backwards compatible changes, or even
> removal, in any future version. Use of the feature is not recommended
> in production environments. Experimental features are not subject to
> the Node.js Semantic Versioning model.

## Installation

```sh
$ npm install arablocks/ara-identity
```

### To install globally,

```sh
$ npm install arablocks/ara-identity --global
```

## Usage

```js
const aid = require('ara-identity')
const context = require('ara-context') // Required for web3 interactions

// Create an Ara ID
const createOpts = {
  context,
  password: 'hello'
}
const identity = aid.create(createOpts)

// Archive an Ara ID
const archiverOpts = {
  secret: 'test-secret',
  network: 'test-archiver',
  keyring: '/home/ubuntu/.ara/keyrings/keyring.pub'
}
// To learn about archiverOpts refer to the below document,
// https://github.com/AraBlocks/ara-network-node-identity-archiver/blob/master/README.md
await aid.archive(identity, archiverOpts)

// Resolve an Ara ID to get  DID-document
const resolverOpts = {
  secret: 'test-secret',
  network: 'test-resolver',
  keyring: '/home/ubuntu/.ara/keyrings/keyring.pub'
}
// To learn about resolverOpts refer to the below document,
// https://github.com/AraBlocks/ara-identity-resolver/blob/master/README.md
const ddo = aid.resolve(aid.identifier, resolverOpts)

// Recover a lost Ara ID using your bip39 mnemonic
const recoverOpts = {
  // valid bip39 mnemonic of the Ara ID being recovered
  mnemonic: 'glad kangaroo coyote rich detail grief matrix spirit jeans owner heart net',
  password: 'qwerty' // New password to be used for encryption of the identity files
}
const identity = aid.recover(recoverOpts)
```

## API
All functions exported by this module will check for input correctness. All functions check for input validity and throw an error if any of the required argument is found to be empty or invalid.

* [aid.archive(identity, opts)](#archive)
* [aid.create(opts)](#create)
* [aid.createIdentityKeyPath(identity)](#createIdPath)
* [aid.did.create(publicKey)](#didCreate)
* [aid.did.getIdentifier(didURI)](#didGetIdentifier)
* [aid.did.normalize(identifier, method)](#didNormalize)
* [aid.ddo.create(opts)](#ddoCreate)
* [aid.fs](#fs)
* [aid.fs.writeFile(identifier, filename, buffer)](#fsWriteFile)
* [aid.fs.readFile(identifier, filename)](#fsReadFile)
* [aid.fs.readdir(identifier)](#fsReaddir)
* [aid.fs.access(identifier, filename)](#fsAccess)
* [aid.fs.lstat(identifier, filename)](#fsLstat)
* [aid.fs.stat(identifier, filename)](#fsStat)
* [aid.list()](#list)
* [aid.recover(opts)](#recover)
* [aid.replicate(did)](#replicate)
* [aid.resolve(did, opts)](#resolve)
* [aid.util.ethHexToBuffer(hexValue)](#utilHexToBuffer)
* [aid.util.toBuffer(value)](#utilToBuffer)
* [aid.util.toHex(buffer)](#utilToHex)
* [aid.util.writeIdentity(identity)](#utilWriteIdentity)

<a name="archive"></a>
### `aid.archive(identity, opts)`
Archive an Ara ID into the Ara network where `identity` is the Ara Identity object created using `create()` method. To learn more about archiving, see [ara archiver][Ara Identity Archiver]
```js
const context = require('ara-context')
const opts = {
  context,
  password: 'hello'
}
const identity = await aid.create(opts)

const archiverOpts = {
  secret: 'test-secret',
  network: 'test-archiver',
  keyring: '/home/ubuntu/.ara/keyrings/keyring.pub'
}
await aid.archive(identity, archiverOpts)
```

<a name="create"></a>
### `aid.create(opts)`
Create an Ara identity encrypted using the provided `password`
```js
//Used for web3 interactions
const context = require('ara-context')
const opts = {
  context,
  password: 'hello'
}

const identity = await aid.create(opts)
```

<a name="createIdPath"></a>
### `aid.createIdentityKeyPath(identity)`
Generate and retrieve the path to files of an identity stored locally
```js
const context = require('ara-context')
const opts = {
  context,
  password: 'hello'
}

const identity = await aid.create(opts)
const path = aid.createIdentityKeyPath(identity)
console.log(path) // Displays the local folder path of the identity
```

<a name="didCreate"></a>
### `aid.did.create(publicKey)`
Create a DID reference document from a given publicKey of a key pair. The `seed` value could be either a random seed buffer or a deterministic seed buffer derived from a value
```js
const { publicKey, secretKey } = crypto.keyPair(seed)
const didUri = did.create(publicKey)
```

<a name="didGetIdentifier"></a>
### `aid.did.getIdentifier(didURI)`
Retrieve the identifier from a DID URI
```js
const did = 'did:ara:8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'

const identifier = aid.did.getIdentifier(did)
console.log(identifier) // '8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'
```

<a name="didNormalize"></a>
### `aid.did.normalize(identifier, method)`
Recreate a DID URI from an identifier & method where `method` is the DID method
```js
const identifier = '8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'
const method = 'ara'

const did = aid.did.normalize(identifier, method)
console.log(didURI) // 'did:ara:8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'
```

<a name="ddoCreate"></a>
### `aid.ddo.create(opts)`
Create a DID document for a given DID URI. See [did-spec][did-document] for more details on DID documents. The `seed` value could be either a random seed buffer or a deterministic seed buffer derived from a value
```js
const { publicKey, secretKey } = crypto.keyPair(seed)
const didUri = did.create(publicKey)
const opts = {
  id: didUri
}

const didDocument = ddo.create(opts)
```

<a name="fs"></a>
### `aid.fs`
`aid.fs` is an an abstract file system access interface, or module, will abstract reads (and writes) from the file system (or CFS/etc) to retrieve files like `ddo.json` or `keystore/ara`. This abstraction allows the caller to consume these files, even if they do not live on the same host machine. This allows services running on servers to bind themselves to identities, without the identity files living on the same machine.

To learn more about Ara remote machines, please refer to [archiver][Ara Identity Archiver] & [resolver][Ara Identity Resolver]

<a name="fsWriteFile"></a>
### `aid.fs.writeFile(identifier, filename, buffer)`
Writes a given file to its identity folder based on a given identifier. This method can only be used to write locally
```js
const context = require('ara-context')
const opts = {
  context,
  password: 'hello'
}
const identity = await aid.create(opts)
const files = identity.files

for (let i = 0; i < files.length; i++) {
  await aid.fs.writeFile(identity.identifier, files[i].path, files[i].buffer)
}
```

<a name="fsReadFile"></a>
### `aid.fs.readFile(identifier, filename)`
Reads a file for a given identifier either from its local copy or from a remote server
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'

const ddo = await aid.fs.readFile(did, 'ddo.json')
console.log(ddo) // Displays the DID document of the given DID
```

<a name="fsReaddir"></a>
### `aid.fs.readdir(identifier)`
Reads the contents of the identity directory for a given identifier. The methods checks both locally and in a remote Ara server
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'

const files = await aid.fs.readdir(did)
console.log(files) // Displays a list of all files present in that identity directory
```
* TODO: Verify method definition to meet with method naming (prashanth)


<a name="fsAccess"></a>
### `aid.fs.access(identifier, filename)`
Check if a file is present in the identity directory of a given identifier. The methods checks both locally and in a remote Ara server
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'
try {
  if(await aid.fs.access(did, 'ddo.json')) {
    console.log('ddo.json file is present')
  }
} catch(err) {
  throw new Error(err)
}
```

<a name="fsLstat"></a>
### `aid.fs.lstat(identifier, filename)`
Retrieve information about a file from the identity directory of a given identifier. The methods checks both locally and in a remote Ara server. Similar to fs.lstat, this method doesn't follow symlinks
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'

const fileInfo = await aid.fs.lstat(did, 'ddo.json')
console.log(fileInfo) // Displays information about the file if found
```

<a name="fsStat"></a>
### `aid.fs.stat(identifier, filename)`
Same as `aid.fs.lstat()`. If the mentioned path is a symlink, this method follows the symlink
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'

const fileInfo = await aid.fs.stat(did, 'ddo.json')
console.log(fileInfo) // Displays information about the file if found
```

<a name="list"></a>
### `aid.list()`
Returns a list all identities present locally in a given path. Defaults to the env root path if no path is provided. To learn more about how `ara-identity` defines environment variables, please check in ara-runtime [docs][rc-docs]
```js
const identities = await list()
console.log(identities) // Displays an Array of identity strings
```

<a name="recover"></a>
### `aid.recover(opts)`
Recover a lost Ara identity by providing a valid bip39 mnemonic returned during creation
```js
const context = require('ara-context')

const opts = {
  context,
  password: 'test',
  mnemonic: 'soda inmate audit purpose logic raise put weasel child major cupboard daring'
}
const identity = await aid.recover(opts)
```

<a name="replicate"></a>
### `aid.replicate(did)`
Replicates all identity files of a given Ara ID as a Buffer array from a remote server(archiver/resolver). Make sure your `.ararc` file contains entries to the DNS & DHT server of the remote node
```js
const did = 'did:ara:8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'
const identityFiles = await aid.replicate(did)
```

<a name="resolve"></a>
### `aid.resolve(did, opts)`
Returns the DID document of an Ara ID either from a local copy or from a remote server. See [ara resolver][resolver-readme].
```js
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
### `aid.util.ethHexToBuffer(hexValue)`
Converts an ethereum style hex string into a buffer
```js
const hex = '8c1bfdd26dd7231a92f11ea29aea8ea32d2156cfb809943794896be643a467b2'
const hexBuffer = aid.util.ethHexToBuffer(hex)
```

<a name="utilToBuffer"></a>
### `aid.util.toBuffer(value)`
Converts any provided value to a buffer
```js
const value = 1234
const buffer = aid.util.toBuffer(value)
```

<a name="utilToHex"></a>
### `aid.util.toHex(buffer)`
Converts a buffer to a hex string.
```js
const buffer = Buffer.from('hello')
const hex = aid.util.toHex(buffer)
```

<a name="utilWriteIdentity"></a>
### `aid.util.writeIdentity(identity)`
Writes given Ara Identity files to the Ara root folder
```js
const context = require('ara-context')
const opts = {
  context,
  password: 'hello'
}

const identity = await aid.create(opts)

await writeIdentity(identity)
```

### CLI
Please refer to the CLI [doc's][cli-docs] for the start-up guide on using `ara-identity` from the terminal

## Contributing
To Contribute to Ara Identity, please look into our latest [issues](https://github.com/AraBlocks/ara-identity/issues) and also make sure to follow the below listed standards,
- [Commit message format](/.github/COMMIT_FORMAT.md)
- [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)
- [How to contribute](/.github/CONTRIBUTING.md)
- [Release Versioning guidelines](https://semver.org/)

## See Also
- [W3C Decentralized ID specs](https://w3c-ccg.github.io/did-spec/)
- [Ara Identity Archiver][Ara Identity Archiver]
- [Ara Identity Resolver][Ara Identity Resolver]
- [Ara Context][context-readme]

## License

LGPL-3.0

[ara-docs]: https://github.com/AraBlocks/papers/blob/master/ara-whitepaper.pdf
[did-document]: https://w3c-ccg.github.io/did-spec/#did-documents
[stability-index]: https://nodejs.org/api/documentation.html#documentation_stability_index
[Ara Identity Archiver]: https://github.com/AraBlocks/ara-network-node-identity-archiver/blob/master/README.md
[Ara Identity Resolver]: https://github.com/AraBlocks/ara-identity-resolver/blob/master/README.md
[context-readme]: https://github.com/AraBlocks/ara-context/blob/master/README.md
[cli-docs]: https://github.com/AraBlocks/ara-identity/blob/master/docs/cli.md
[rc-docs]: https://github.com/AraBlocks/ara-runtime-configuration/blob/master/README.md
