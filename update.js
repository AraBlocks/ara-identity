const { create } = require('./create')
// const debug = require('debug')('ara:identity:update')

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

  return create(opts)
}

module.exports = {
  update
}
