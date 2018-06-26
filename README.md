ara-identity
============

Create and resolve decentralized identity based Ara identifiers.


## Status
This project is still in alpha development.

> **Important**: While this project is under active development, run `npm link` in `ara-identity` directory & `npm link ara-identity` in the `ara-network-node-identity-archiver`, `ara-network`, or `ara-network-node-dns` directory.

## Dependencies
- [Node](https://nodejs.org/en/download/)

## Installation

```sh
$ npm install --save ara-identity
```

## Usage

```js
const { resolve } = require('ara-identity')
// @TODO
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
