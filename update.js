const debug = require('debug')('ara:identity:update')
const fs = require('./fs')

const { create } = require('./create')

/**
 * Updates an ARA identity.
 */
async function update(identifier, opts) {
  if (null == opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting object.')
  }

  if (opts.ddo) {
    opts.created = opts.ddo.created
    opts.updated = new Date()
  }

  if (!opts.keystore) {
    opts.keystore = {}

    try {
      opts.keystore.ara = JSON.parse(await fs.readFile(identifier, 'keystore/ara'))
    } catch (err) {
      debug(err)
    }

    try {
      opts.keystore.eth = JSON.parse(await fs.readFile(identifier, 'keystore/eth'))
    } catch (err) {
      debug(err)
    }
  }

  return create(opts)
}

module.exports = {
  update
}
