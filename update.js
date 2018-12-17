const { resolve } = require('./resolve')
const { create } = require('./create')
const debug = require('debug')('ara:identity:update')

/**
 * Updates an ARA identity.
 */
async function update(identifier, opts) {
  if (null == opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting object.')
  }

  let ddo = null

  if (opts.ddo && opts.ddo.toJSON) {
    opts.ddo = JSON.parse(JSON.stringify(opts.ddo.toJSON()))
  }

  try {
    ddo = await resolve(identifier)

    if (ddo.publicKey && opts.ddo.publicKey) {
      append(ddo.publicKey, opts.ddo.publicKey)
    } else if (ddo.publicKey) {
      opts.ddo.publicKey = ddo.publicKey
    }

    if (ddo.authentication && opts.ddo.authentication) {
      append(ddo.authentication, opts.ddo.authentication)
    } else if (ddo.authentication) {
      opts.ddo.authentication = ddo.authentication
    }

    if (ddo.service && opts.ddo.service) {
      append(ddo.service, opts.ddo.service)
    } else if (ddo.service) {
      opts.ddo.service = ddo.service
    }
  } catch (err) {
    debug(err)
  }

  if (ddo) {
    opts.created = ddo.created
    opts.updated = new Date()
    opts.ddo = ddo
  }

  return create(opts)
}

function append(left, right) {
  for (const x of right) {
    left.push(x)
  }
}

module.exports = {
  update
}
