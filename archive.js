

const { createSwarm } = require('ara-network/discovery')
const { createCFS } = require('cfsnet/create')
const { toHex } = require('./util')
const archiver = require('ara-identity-archiver')
const ram = require('random-access-memory')

/**
 * Archive an identity into the network with
 * `ara-identity-archiver'.
 * @public
 * @param {Object} identity
 * @param {Object} opts
 */
async function archive(identity, opts) {
  if (null == identity || 'object' !== typeof identity) {
    throw new TypeError('ara-identity.archiver.archive: Expecting identity object.')
  }

  if (null == opts || 'object' !== typeof opts) {
    throw new TypeError('ara-identity.archive: Expecting options object.')
  }

  const { publicKey, secretKey, files } = identity

  const cfs = await createCFS({
    secretKey,
    storage: ram,
    shallow: true,
    key: publicKey,
    id: toHex(publicKey),
  })

  /* eslint-disable no-await-in-loop */
  for (const file of files) {
    await cfs.writeFile(file.path, file.buffer)
  }
  /* eslint-enable no-await-in-loop */

  Object.assign(opts, { onidentifier, onkey, onend })

  let timeout = null
  let retries = opts.retries || 3
  const result = { network: null }

  await connect()
  clearTimeout(timeout)

  await new Promise((resolve, reject) => {
    const discovery = createSwarm({
      stream() {
        const stream = cfs.replicate({ live: false })
        stream.once('end', onend)
        return stream
      }
    })

    discovery.join(cfs.discoveryKey)
    discovery.once('error', onend)

    /* eslint-disable no-shadow */
    function onend(err) {
      if (err && err instanceof Error) { reject(err) } else { resolve() }
      discovery.destroy()
      return null
    }
    /* eslint-enable no-shadow */
  })

  return result

  async function connect() {
    clearTimeout(timeout)
    timeout = setTimeout(ontimeout, opts.timeout || 5000)
    const { network } = await archiver.sync.connect(opts)
    clearTimeout(timeout)
    result.network = network
  }

  function ontimeout() {
    clearTimeout(timeout)
    if (result.network) {
      result.network.swarm.destroy()
    }

    if (--retries > 0) {
      connect()
    } else {
      throw new Error('Failed to contact peer to archive identity.')
    }
  }

  function onidentifier() {
    return cfs.identifier
  }

  function onkey() {
    return cfs.key
  }

  /* eslint-disable no-shadow */
  function onend() {
    clearTimeout(timeout)
    if (result.network) {
      result.network.swarm.destroy()
    }
  }
  /* eslint-enable no-shadow */
}

module.exports = {
  archive
}
