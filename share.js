const { createIdentityKeyPath } = require('./key-path')
const { createSwarm } = require('ara-network/discovery/swarm')
const { createCFS } = require('cfsnet/create')
const { toHex } = require('./util')
const path = require('path')
const pump = require('pump')
const did = require('./did')
const raf = require('random-access-file')

async function share(identity, opts = {}) {
  // DID?
  if ('string' === typeof identity) {
    const ddo = did.parse(did.normalize(identity))
    const publicKey = Buffer.from(ddo.identifier, 'hex')
    identity = { publicKey }
  }

  const { publicKey } = identity
  const cfs = await createCFS({
    shallow: true,
    key: publicKey,
    id: toHex(publicKey),

    storage(filename, drive, dir) {
      const root = createIdentityKeyPath({ publicKey })
      if ('function' === typeof opts.storage) {
        return opts.storage(filename, drive, root)
      }

      if ('home' === path.basename(dir)) {
        return raf(path.resolve(root, 'home', filename))
      }

      return raf(path.resolve(root, filename))
    }
  })

  const swarm = createSwarm({ }).on('connection', onconnection)

  swarm.join(cfs.discoveryKey, { announce: true })

  return swarm

  function onconnection(connection) {
    const stream = cfs.replicate({ download: false, upload: true, live: true })
    pump(stream, connection, stream, (err) => {
      if (err) {
        swarm.emit('error', err)
      }
    })
  }
}

module.exports = {
  share
}
