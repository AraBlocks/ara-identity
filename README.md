<img src="https://github.com/AraBlocks/docs/blob/master/ara.png" width="30" height="30" /> ara-identity
======================================

[![Build Status](https://travis-ci.com/AraBlocks/ara-identity.svg?token=Ty4yTmKT8aELetQd1xZp&branch=master)](https://travis-ci.com/AraBlocks/ara-identity)

Create and resolve decentralized identity based Ara identifiers.

## Status

This project is still in alpha development.


## Dependencies

- [Node](https://nodejs.org/en/download/)

## Installation

```sh
$ npm install --save ara-identity
```

## Usage - Running ara-identity modules locally

### Prerequisites

#### Setup the CLI for Ara Identity & Ara Network

  - Clone the [ara-identity](https://github.com/AraBlocks/ara-identity) & [ara-network](https://github.com/AraBlocks/ara-network) repositories
  - Do `npm install` & then `npm link` inside each of the repositories
  - Test the CLI by running the following commands,
  ```sh
  $ aid --help // Ara Identity CLI
  $ ann --help // Ara Network Node CLI
  $ ank --help // Ara Network Keyring CLI
  ```
  - The above commands should display the help options for each of the cli's

**Note**: To learn more about ara network & keyrings, please read through the following RFCs,

- [Ara network](https://github.com/AraBlocks/RFCs/blob/master/text/0002-ann.md)
- [Ara keyring](https://github.com/AraBlocks/RFCs/blob/master/text/0003-ank.md)

#### Setup archiver & resolver network nodes locally

To make publish Ara ID into our network and make it discoverable by other peers, you can either use one of our archiver nodes or setup one locally

To setup network nodes locally, please follow the README in the respective repositories below,

- [identity-archiver](https://github.com/AraBlocks/ara-network-node-identity-archiver/blob/master/README.md)
- [identity-resolver](https://github.com/AraBlocks/ara-network-node-identity-resolver/blob/master/README.md)

### 1. Create an Ara ID

To create a new Ara ID, use the create option of the ARA Identity CLI

```sh
$ aid create
```

### 2. Set default Ara ID locally

Set a default Ara identity locally by editing the `whoami` entry under [rc.js](https://github.com/AraBlocks/ara-identity/blob/master/rc.js)

To test it, run the following command

```sh
$ aid whoami
```


### 3. Archive an Ara ID
Archiving an identity is the process of broadcasting newly created identities so that they can be resolved & discovered by other services & endpoints in the ARA network.

- `$ aid archive <ara-id> \
                 -s <shared-secret>
                 -n <keyring-network-entry>
                 -k <public-keyring-file>`

- Example:
  ```sh
  $ aid archive did:ara:df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9 \
                -s 'ara-secret' \
                -n 'archiver' \
                -k '~/.ara/keyrings/keyring.pub'
  ```

### Resolve an ARA ID
ARA network has special network nodes which act as an Identity resolver's(similar to a DNS lookup). These resolvers provide a method interface and a REST API through which services can send requests and obtain the DDO document associated with an ARA ID

- `$ aid resolve <ara-id> \
                 -s <shared-secret>
                 -n <keyring-network-entry>
                 -k <public-keyring-file>`

To resolve an identity, use the `resolve` method as below.

#### Method - 1

```sh
$ aid resolve did:ara:df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9 \
              -s 'ara-secret' \
              -n 'resolver' \
              -k '~/.ara/keyrings/keyring.pub'
```


## API

TODO

### `resolve(uri)`

TODO

### `create(opts)`

TODO

### `ethereum`

TODO

#### `ethereum.account`

TODO

#### `ethereum.account.create(opts)`

TODO

#### `ethereum.account.load(opts)`

TODO

#### `ethereum.entropy([size])`

TODO

#### `ethereum.wallet`

TODO

#### `ethereum.wallet.load()`

## Tests

### Prerequisites

Before running tests, you must start `truffle develop` to run a local
blockchain to ensure web3 tests _actually_ pass. You can do this by
simply running the `npm run truffle` command from the root of the
project.

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
