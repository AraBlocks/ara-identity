<img align="right" src="https://github.com/AraBlocks/docs/blob/master/ara.png" width="90" height="90" />

# Ara Identity

[![Build Status](https://travis-ci.com/AraBlocks/ara-identity.svg?token=Ty4yTmKT8aELetQd1xZp&branch=master)](https://travis-ci.com/AraBlocks/ara-identity)

Ara Identity is an implementation of [Decentralized Identifiers](https://w3c-ccg.github.io/did-spec/) which allows users to interact with services in the Ara network. It provides the users with an ability to access the services running on the Ara network. To learn more about Ara, please visit our project [site](https://ara.one/)

## Table of Contents
* [Status](#status)
* [Installation](#installation)
* [Setup](#setup)
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
TODO

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
