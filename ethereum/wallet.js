/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
const isZeroBuffer = require('is-zero-buffer')
const isBuffer = require('is-buffer')
const debug = require('debug')('ara-identity:ethereum:wallet')

// We must do this awkward cascade of `try/catch' require statements
// because of broken deployments of the `ethereumjs-wallet' modules
// on github at https://github.com/ethereumjs/ethereumjs-wallet
//
// This commit caused the initial break (after it was published):
//   https://github.com/ethereumjs/ethereumjs-wallet/commit/f69a16ffb2e59f9437a5a61466ad93b5861fe4e5
//
// This commit addressed it:
//   https://github.com/ethereumjs/ethereumjs-wallet/commit/efd2012e44b3ed7b1c2f30e8a7e16b499c385ff3
//
// We ultimatey needed to create binary builds with `pkg', but couldn't because of this
// breaking commit where a glob in the files array of the package.json file matched a wildcard
// of javascript files on the root directory:
//   https://github.com/ethereumjs/ethereumjs-wallet/commit/b4c1c2e3db7e73fe909ce59fd2066c39e2864456
//
// Which prompted a fix here:
//   https://github.com/ethereumjs/ethereumjs-wallet/pull/67
//
// However, while we wait for it to be merged (or not), we use a fork of the ethereumjs-wallet
// module at https://github.com/AraBlocks/ethereumjs-wallet, which is not a bunded source, so
// we must require modules directly from the `src/' directory
let hdkey = null

try { hdkey = require('ethereumjs-wallet/dist/hdkey') } catch (err0) {
  debug(err0)
  try { hdkey = require('ethereumjs-wallet/hdkey') } catch (err1) {
    debug(err1)
    try { hdkey = require('ethereumjs-wallet/src/hdkey') } catch (err2) {
      debug(err2)
      throw new Error('Failed to load ethereumjs-wallet/hdkey.')
    }
  }
}

const { fromMasterSeed } = hdkey

async function load(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('ethereum.wallet.load: Expecting object.')
  }

  if (!opts.seed) {
    throw new TypeError('ethereum.wallet.load: Expecting seed to create wallet.')
  }

  if (false === isBuffer(opts.seed) || true === isZeroBuffer(opts.seed)) {
    throw new TypeError('ethereum.wallet.load: Expecting seed to be a non-zero buffer.')
  }

  const { seed } = opts
  const master = fromMasterSeed(seed)

  return master.getWallet()
}

module.exports = {
  load
}
