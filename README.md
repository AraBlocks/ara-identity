<img src="https://github.com/AraBlocks/docs/blob/master/ara.png" width="30" height="30" />
======================================

[![Build Status](https://travis-ci.com/AraBlocks/ara-identity.svg?token=Ty4yTmKT8aELetQd1xZp&branch=master)](https://travis-ci.com/AraBlocks/ara-identity)

# Ara Identity

Ara Identity is an implementation of [Decentralized Identifiers](https://w3c-ccg.github.io/did-spec/) which allows users to interact with services in the Ara network. It provides the users with an ability to access the services running on the Ara network. To learn more about Ara, please visit our project [site](https://ara.one/)

## Table of Contents
* [Status](#status)
* [Installation](#installation)
* [Setup](#setup)
* [Javascript API](#js-api)
* [For Developers](#for-dev)

## Status

This project is still in active development.

## Installation

```sh
$ npm install arablocks/ara-identity
```

## Setup

  - Clone the [ara-identity](https://github.com/AraBlocks/ara-identity)
  - Do `npm install` & then `npm link` inside each of the repositories
  - Test the CLI by running the following commands,
  ```sh
  $ aid --help // Ara Identity CLI
  ```

**Note**: To learn more about ara network & keyrings, please read through the following RFCs,

- [Ara network](https://github.com/AraBlocks/RFCs/blob/master/text/0002-ann.md)
- [Ara keyring](https://github.com/AraBlocks/RFCs/blob/master/text/0003-ank.md)

#### Setup archiver & resolver network nodes locally

To publish Ara ID into our network and make it discoverable by other peers, you can either use one of our archiver nodes or setup one locally

**TODO**: Decide if we want to add our own archiver/resolver config reference here

To setup network nodes locally, please follow the instruction in the respective repositories below,

- [identity-archiver](https://github.com/AraBlocks/ara-network-node-identity-archiver/blob/master/README.md)
- [identity-resolver](https://github.com/AraBlocks/ara-network-node-identity-resolver/blob/master/README.md)


## Tests

### Running test

Tests are defined in the `test/` directory and are invoked with
[ava](https://github.com/avajs/ava). To run the tests, simply run:

```sh
$ npm test
```

## Contributing
- [Commit message format](/.github/COMMIT_FORMAT.md)
- [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)
- [How to contribute](/.github/CONTRIBUTING.md)

## See Also
- [ara-network](https://github.com/AraBlocks/ara-network)
- [W3C Decentralized IDs specs](https://w3c-ccg.github.io/did-spec/)

## License

LGPL-3.0
