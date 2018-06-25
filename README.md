<img src="https://github.com/AraBlocks/docs/blob/master/ara.png" width="30" height="30" /> ara-identity
======================================

[![Build Status](https://travis-ci.com/AraBlocks/ara-identity.svg?token=Ty4yTmKT8aELetQd1xZp&branch=master)](https://travis-ci.com/AraBlocks/ara-identity)

Create and resolve decentralized identity based Ara identifiers.


## Status
This project is still in alpha development.

> **Important**: While this project is under active development, run `npm link` in `ara-identity` directory & `npm link ara-identity` in the `ara-network-node-identity-archiver`, `ara-network`, or `ara-network-node-dns` directory.

## Dependencies
- [Node](https://nodejs.org/en/download/)

## Installation

```sh
$ npm install --save ara-identity
$ npm link
```

## Usage - Running ara-identity modules locally

### Prerequisites
Setup the CLI for ARA Identity & ARA Network

  - Clone the [ara-identity](https://github.com/AraBlocks/ara-identity) & [ara-network](https://github.com/AraBlocks/ara-network) repositories
  - Do `npm install` & then `npm link` inside each of the repositories
  - Test the CLI by running the following commands,
  ```sh
  $ aid --help // ARA Identity CLI
  $ ann --help // ARA Network Node CLI
  $ ans --help // ARA Network Secrets CLI
  ```
  - The above commands should display the help options for each of the cli's

Generate secrets for both the Archiver & Resolver nodes

  - `$ ans -k ${network_key_string}`

  - Example:
  ```sh
  $ ans -k archiver // Generating secrets for the archiver node
  $ ans -k resolver // Generating secrets for the resolver node
  ```

Once the secrets are generated, the Archiver & Resolver Network nodes can be started.

  - Clone the [archiver](https://github.com/AraBlocks/ara-network-node-identity-archiver) and [resolver](https://github.com/AraBlocks/ara-network-node-identity-resolver) repositories
  - Do `npm install` in each of the repositories
  - Open the repository folder in 2 separate windows and run the below command,
    - `$ ann -t . -k ${network_key_string}`

    - Example:
      ```sh
      $ ann -t . -k archiver // starting the archiver network node
      $ ann -t . -k resolver // starting the resolver network node
      ```


Note : Make sure to use different `network_key_string` for the Archiver & Resolver Network Nodes

### Create an ARA ID

To create a new ARA ID, use the create option of the ARA Identity CLI

```sh
$ aid create
```

### Archive an ARA ID
Archiving an identity is the process of broadcasting newly created identities so that they can be resolved & discovered by other services & endpoints in the ARA network.

- `$ aid archive ${ara_id} -k ${network_key_string}`

- Example:
  ```sh
  $ aid archive did:ara:df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9 -k archiver
  ```

### Resolve an ARA ID
ARA network has special network nodes which act as an Identity resolver's(similar to a DNS lookup). These resolvers provide a method interface and a REST API through which services can send requests and obtain the DDO document associated with an ARA ID

To resolve an identity, use the `resolve` method or the resolver API as below.

#### Method - 1

```sh
$ aid resolve did:ara:df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9 -k resolver
```

#### Method - 2 (API not configured yet)
```sh
curl -X GET https://araresolver.io/1.0/identifiers/${ara_id}?key=${network_key_string}
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
