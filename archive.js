'use strict'

const archiver = require('ara-identity-archiver')

/**
 * Archive an identity into the network with
 * `ara-identity-archiver'.
 * @public
 * @param {Object} identity
 * @param {Object} opts
 */
async function archive(identity, opts) {
  if (null == identity || 'object' != typeof identity) {
    throw new TypeError(
      "ara-identity.archiver.archive: Expecting identity object.")
  }

  if (null == opts || 'object' != typeof opts) {
    throw new TypeError("ara-opts.archiver.archive: Expecting options object.")
  }

  Object.assign(opts, { onidentifier, onstream, onkey, onend })

  const { network } = await archiver.sync.connect(opts)

  function onidentifier(connection, info) {
    return identity.cfs.identifier
  }

  function onstream(connection, info) {
    return identity.cfs.replicate({ live: false })
  }

  function onkey(connection, info) {
    return identity.cfs.key
  }

  function onend(connection, info) {
    network.swarm.destroy()
  }
}

module.exports = {
  archive
}
