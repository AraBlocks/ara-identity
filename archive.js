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
    throw new TypeError("ara-identity.archive: Expecting options object.")
  }

  Object.assign(opts, { onidentifier, onstream, onkey, onend })

  let retries = opts.retries || 3
  const result = { network: null }
  setTimeout(ontimeout, opts.timeout || 5000)
  await connect()
  return result

  async function connect() {
    const { network } = await archiver.sync.connect(opts)
    result.network = network
  }

  function ontimeout() {
    network.swarm.destroy()
    if (retries-- > 0) {
      connect()
    } else {
      throw new Error("Out of retries in timeout")
    }
  }

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
