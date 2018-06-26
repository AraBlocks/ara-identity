<img src="https://github.com/AraBlocks/docs/blob/master/ara.png" width="30" height="30" /> ara-identity
======================================

[![Build Status](https://travis-ci.com/AraBlocks/ara-identity.svg?token=Ty4yTmKT8aELetQd1xZp&branch=master)](https://travis-ci.com/AraBlocks/ara-identity)

============

Create and resolve decentralized identity based Ara identifiers.

## Installation

```sh
$ npm install --save ara-identity
```

## Usage - Running ara-identity modules locally

### Prerequisites

* Setup the CLI for ARA Identity & ARA Network

  * Clone the [ara-identity](https://github.com/AraBlocks/ara-identity) & [ara-network](https://github.com/AraBlocks/ara-network) repositories
  * Do `npm install` & then `npm link` inside each of the repositories
  * Test the CLI by running the following commands,
      * `aid --help` - ARA Identity CLI
      * `ann --help` - ARA Network Node CLI
      * `ans --help` - ARA Network Secrets CLI
  * The above commands should display the help options for each of the cli's

* Generate secrets for both the Archiver & Resolver nodes

  * `ans -k ${Network key string}`


* Once the secrets are generated, the Archiver & Resolver Network nodes can be started.

  * Clone the [archiver](https://github.com/AraBlocks/ara-network-node-identity-archiver) and [resolver](https://github.com/AraBlocks/ara-network-node-identity-resolver) repositories
  * Do `npm install` in each of the repositories
  * Open the repository folder in 2 separate windows and run the below command,
    * `ann -t . -k ${Network key string}`

Note : Make sure to use different `Network Key String` for the Archiver & Resolver Network Nodes

### Create an ARA ID

To create a new ARA ID, use the create option of the ARA Identity CLI

* `aid create`

### Archive an ARA ID

Archiving an identity is the process of broadcasting newly created identities so that they can be resolved & discovered by other services & endpoints.

* `aid archive ${ara_id} -k ${network_key_string}`


### Resolve an ARA ID

ARA network has special network nodes which act as an Identity resolver(similar to a DNS lookup). These resolvers provide a method interface and a REST API through which services can send requests and obtain the DDO document associated with an ARA ID

To resolve an identity, use the `resolve` method or the resolver API as below.

#### Method - 1

* `aid resolve ${ara_id} -k ${network_key_string}`

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

## License

LGPL-3.0
