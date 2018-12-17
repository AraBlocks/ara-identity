const { resolve } = require('./resolve')
const { create } = require('./create')
const debug = require('debug')('ara:identity:update')
const ddo = require('./ddo')

/**
 * Updates an ARA identity.
 */
async function update(identifier, opts) {
  if (null == opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting object.')
  }

  if (!opts.ddo) {
    try {
      const resolution = ddo.create(await resolve(identifier))
      if (resolution.publicKey && opts.ddo.publicKey) {
        append(resolution.publicKey, opts.ddo.publicKey)
      } else if (resolution.publicKey) {
        opts.ddo = resolution.publicKey
      }

      if (resolution.authentication && opts.ddo.authentication) {
        append(resolution.authentication, opts.ddo.authentication)
      } else if (resolution.authentication) {
        opts.ddo = resolution.authentication
      }

      if (resolution.service && opts.ddo.service) {
        append(resolution.service, opts.ddo.service)
      } else if (resolution.service) {
        opts.ddo = resolution.service
      }
    } catch (err) {
      debug(err)
    }
  }

  return create(opts)
}

function append(left, right) {
  for (const x of left) {
    right.push(x)
  }
}

module.exports = {
  update
}
