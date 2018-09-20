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

// Recovering an Ara ID using bip39 mnemonic
const identity = aid.recover({mnemonic: 'hello silver ......', password: 'qwerty'})
```

### Ara References
* [archiving][archiver-readme]
* [resolving][resolver-readme]

## CLI


## API
All functions exported by this module will check for input correctness. If given an invalid input, a function will throw a `TypeError` with the error message.

* [aid.archive()](#archive)
* [aid.create()](#create)
* [aid.createIdentityKeyPath()](#)
* [aid.ddo.create()](#ddoCreate)
* [aid.did.create()](#didCreate)
* [aid.did.getIdentifier()](#didGetIdentifier)
* [aid.did.normalize()](#didNormalize)
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
### `aid.archive()`

<a name="create"></a>
### `aid.create()`

<a name="ddoCreate"></a>
### `aid.ddo.create()`

<a name="didCreate"></a>
### `aid.did.create()`

<a name="didGetIdentifier"></a>
### `aid.did.getIdentifier()`

<a name="didNormalize"></a>
### `aid.did.normalize()`

<a name="fsWriteFile"></a>
### `aid.fs.writeFile()`

<a name="fsReadFile"></a>
### `aid.fs.readFile()`

<a name="fsReaddir"></a>
### `aid.fs.readdir()`

<a name="fsAccess"></a>
### `aid.fs.access()`

<a name="fsLstat"></a>
### `aid.fs.lstat()`

<a name="fsStat"></a>
### `aid.fs.stat()`

<a name="list"></a>
### `aid.list()`

<a name="recover"></a>
### `aid.recover()`

<a name="replicate"></a>
### `aid.replicate()`

<a name="resolve"></a>
### `aid.resolve()`

<a name="utilHexToBuffer"></a>
### `aid.util.ethHexToBuffer()`

<a name="utilToBuffer"></a>
### `aid.util.toBuffer()`

<a name="utilToHex"></a>
### `aid.util.toHex()`

<a name="utilWriteIdentity"></a>
### `aid.util.writeIdentity()`

## For Developers
To Contribute to Ara Identity, please look into our latest [issues](https://github.com/AraBlocks/ara-identity/issues) and also make sure to follow the below listed standards,
- [Commit message format](/.github/COMMIT_FORMAT.md)
- [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)
- [How to contribute](/.github/CONTRIBUTING.md)

## References
- [W3C Decentralized IDs specs](https://w3c-ccg.github.io/did-spec/)

## License

LGPL-3.0

[stability-index]: https://nodejs.org/api/documentation.html#documentation_stability_index
[archiver-readme]: https://github.com/AraBlocks/ara-network-node-identity-archiver/blob/master/README.md
[resolver-readme]: https://github.com/AraBlocks/ara-network-node-identity-resolver/blob/master/README.md
