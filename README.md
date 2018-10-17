<img src="https://github.com/arablocks/ara-module-template/blob/master/ara.png" width="30" height="30" /> ara-identity
========

[![Build Status](https://travis-ci.com/AraBlocks/ara-identity.svg?token=Ty4yTmKT8aELetQd1xZp&branch=master)](https://travis-ci.com/AraBlocks/ara-identity)

Ara Identity is an implementation of DIDs, or [Decentralized Identifiers](https://w3c-ccg.github.io/did-spec/), which allows users to interact with services in the Ara network. A DID document in JSON format is called a `DDO` (DID document object).

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

## Usage

```js
const aid = require('ara-identity')
const context = require('ara-context')()

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
  keyring: '~/.ara/keyrings/keyring.pub'
}
await aid.archive(identity, archiverOpts)

// Resolve an Ara ID to get DID-document
const resolverOpts = {
  secret: 'test-secret',
  network: 'test-resolver',
  keyring: '~/.ara/keyrings/keyring.pub'
}
const ddo = aid.resolve(identity.identifier, resolverOpts)

// Recover a lost Ara ID using a valid bip39 mnemonic
const recoverOpts = {
  mnemonic: 'glad kangaroo coyote rich detail grief matrix spirit jeans owner heart net',
  password: 'qwerty' // New password to be used for encryption of the identity files
}
const identity = aid.recover(recoverOpts)
```

## API
All functions check for input validity, input correctness, and throw an error if checks do not pass.

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
* [aid.revoke(opts)](#revoke)

<a name="archive"></a>
### `aid.archive(identity, opts)`
Archive an Ara ID into the Ara network where `identity` is the Ara Identity object created using `create()` method. See also [Ara Identity Archiver][Ara Identity Archiver].
```js
const context = require('ara-context')()
const opts = {
  context,
  password: 'hello'
}
const identity = await aid.create(opts)

const archiverOpts = {
  secret: 'test-secret',
  network: 'test-archiver',
  keyring: '~/.ara/keyrings/keyring.pub'
}

await aid.archive(identity, archiverOpts)
```

<a name="create"></a>
### `aid.create(opts)`
Create an Ara identity encrypted using the provided `password`.
```js
const context = require('ara-context')()

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
const context = require('ara-context')()
const opts = {
  context,
  password: 'hello'
}
const identity = await aid.create(opts)

const path = aid.createIdentityKeyPath(identity)
```

<a name="didCreate"></a>
### `aid.did.create(publicKey)`
Create a DID reference document from a given publicKey of a key pair.
```js
const { publicKey, secretKey } = crypto.keyPair()

const didUri = did.create(publicKey)
```

<a name="didGetIdentifier"></a>
### `aid.did.getIdentifier(didURI)`
Retrieve the identifier from a DID URI.
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'

const identifier = aid.did.getIdentifier(did)

console.log(identifier) // '4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'
```

<a name="didNormalize"></a>
### `aid.did.normalize(identifier, method)`
Recreate a DID URI from an identifier and DID method.
```js
const identifier = '4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'
const method = 'ara'

const didURI = aid.did.normalize(identifier, method)

console.log(didURI) // 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'
```

<a name="ddoCreate"></a>
### `aid.ddo.create(opts)`
Create a [DID document][did-document] for a given DID URI.
```js
const { publicKey, secretKey } = crypto.keyPair()
const didUri = did.create(publicKey)
const opts = {
  id: didUri
}

const didDocument = ddo.create(opts)
```

<a name="fs"></a>
### `aid.fs`
`aid.fs` is an an abstract file system interface for reading and writing identity files for an identity on disk or from the network. It provides a familiar FS API exposing functions like `readFile` and `writeFile`. Most operations will use the `fs` module directly, but if a file is not found, it will ask the network for it. This allows services running on servers to bind themselves to identities, without the identity files living on the same machine. More information about remote servers can be found at [archiver][Ara Identity Archiver] & [resolver][Ara Identity Resolver].

<a name="fsWriteFile"></a>
### `aid.fs.writeFile(identifier, filename, buffer)`
Write a file to its local identity directory based on a given identifier.
```js
const context = require('ara-context')()
const opts = {
  context,
  password: 'hello'
}
const identity = await aid.create(opts)
const files = identity.files

for (let i = 0; i < files.length; i++) {
  await aid.fs.writeFile(identity.identifier, files[i].path, files[i].buffer)
}

/*
Example resulting file structure:
0b86f22e88e1be3c243f3604981683a3f51808103c98bcf99b6b72cfe9646cc1/
├── ddo.json
├── identity
├── keystore
│   ├── ara
│   └── eth
└── schema.proto
*/
```

<a name="fsReadFile"></a>
### `aid.fs.readFile(identifier, filename)`
Read a file for a given identifier from its local copy or a remote server.
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'

const ddo = await aid.fs.readFile(did, 'ddo.json')
```

<a name="fsReaddir"></a>
### `aid.fs.readdir(identifier)`
Read the contents of the identity directory for a given identifier. The identity directory may be located on a remote server.
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'

const files = await aid.fs.readdir(did)
console.log(files) // Displays a list of all files present in that identity directory
```
* TODO: Verify method definition to meet with method naming (prashanth)


<a name="fsAccess"></a>
### `aid.fs.access(identifier, filename)`
Check if a file is present in the identity directory of a given identifier. The identity directory may be located on a remote server.
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'
try {
  if( await aid.fs.access(did, 'ddo.json') ) {
    console.log('ddo.json file is present')
  }
} catch(err) {
  throw new Error(err)
}
```

<a name="fsLstat"></a>
### `aid.fs.lstat(identifier, filename)`
Retrieve information about a file from the identity directory of a given identifier. The identity directory may be located on a remote server. Throws error if file is not found.
**Note**: This function does _not_ follow symlinks.
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'

const stats = await aid.fs.lstat(did, 'ddo.json')
* TODO: put example print out here.
```

<a name="fsStat"></a>
### `aid.fs.stat(identifier, filename)`
Retrieve information about a file from the identity directory of a given identifier. The identity directory may be located on a remote server. Throws error if file is not found. This function will follow symlinks.
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'

const stats = await aid.fs.stat(did, 'ddo.json')
* TODO: put example print out here.
```

<a name="list"></a>
### `aid.list([path])`
Return a list all identities present locally in a given path. `path` defaults to env root path if no path is provided. See [ara-runtime-configuration docs][rc-docs] for more information about environment variables.
```js
const identities = await list()
* TODO: put example print out here.
```

<a name="recover"></a>
### `aid.recover(opts)`
Recover a lost Ara identity by providing the valid bip39 mnemonic returned during creation.
```js
const context = require('ara-context')()

const opts = {
  context,
  password: 'newpassword',
  mnemonic: 'glad kangaroo coyote rich detail grief matrix spirit jeans owner heart net'
}

const identity = await aid.recover(opts)
```

<a name="replicate"></a>
### `aid.replicate(did)`
Replicate all identity files of a given Ara ID as a Buffer array from a remote server.
**Note**: Ensure `.ararc` file contains entries to the DNS & DHT server of the remote node.
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'
const identityFiles = await aid.replicate(did)
```

<a name="resolve"></a>
### `aid.resolve(did, opts)`
Return the DID document of an Ara ID from a local copy or a remote server. See [Ara Identity Resolver][Ara Identity Resolver] for more information.
```js
const did = 'did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45'
const opts = {
  secret: 'test-secret',
  network: 'resolver',
  keyring: '~/.ara/keyrings/keyring.pub'
}
const ddo = await aid.resolve(did, opts)
* TODO: put example print out here. (DID document in JSON format)
```

<a name="revoke"></a>
### `aid.revoke(opts)`
Revoke an Ara ID using the the valid bip39 mnemonic returned during creation. This action cannot be reverted. Note: Please archive your identity after revoking to publish changes into the ara network.
```js
const opts = {
  mnemonic: 'glad kangaroo coyote rich detail grief matrix spirit jeans owner heart net',
  password: 'newpassword'
}
const revokedIdentity = await aid.revoke(opts)
```

## CLI
See [CLI Readme][cli-docs] to use `ara-identity` from the command line.

## Contributing
- [Commit message format](/.github/COMMIT_FORMAT.md)
- [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)
- [How to contribute](/.github/CONTRIBUTING.md)
- [Release Versioning guidelines](https://semver.org/)

## See Also
- [W3C Decentralized ID specs](https://w3c-ccg.github.io/did-spec/)
- [Ara Identity Archiver][Ara Identity Archiver]
- [Ara Identity Resolver][Ara Identity Resolver]
- [Ara Context][context-readme]
- [ara-crypto][Ara Crypto]
- [ara-context][Ara Context]

## License

LGPL-3.0

[Ara Context]: https://github.com/AraBlocks/ara-context/blob/master/README.md
[Ara Crypto]: https://github.com/AraBlocks/ara-crypto/blob/master/README.md
[ara-docs]: https://github.com/AraBlocks/papers/blob/master/ara-whitepaper.pdf
[did-document]: https://w3c-ccg.github.io/did-spec/#did-documents
[stability-index]: https://nodejs.org/api/documentation.html#documentation_stability_index
[Ara Identity Archiver]: https://github.com/AraBlocks/ara-network-node-identity-archiver/blob/master/README.md
[Ara Identity Resolver]: https://github.com/AraBlocks/ara-identity-resolver/blob/master/README.md
[context-readme]: https://github.com/AraBlocks/ara-context/blob/master/README.md
[cli-docs]: https://github.com/AraBlocks/ara-identity/blob/master/docs/cli.md
[rc-docs]: https://github.com/AraBlocks/ara-runtime-configuration/blob/master/README.md
