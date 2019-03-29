const { createIdentityKeyPath } = require('./key-path')
const { EventEmitter } = require('events')
const { createSwarm } = require('ara-network/discovery/swarm')
const { createCFS } = require('cfsnet/create')
const { toHex } = require('./util')
const debug = require('debug')('ara:identity:share')
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

  const swarms = Object.assign(new EventEmitter(), {
    stream: createSwarm({ stream: onstream }),
    connection: createSwarm({ }).on('connection', onconnection),

    close() {
      try { swarms.stream.close() } catch (err) {
        swarms.stream.destroy()
      }

      try { swarms.connection.close() } catch (err) {
        swarms.connection.destroy()
      }
    }
  })

  proxyEvents(swarms.stream)
  proxyEvents(swarms.connection)

  swarms.stream.join(cfs.discoveryKey)
  swarms.connection.join(cfs.discoveryKey, { announce: true })

  return swarms

  function proxyEvents(src) {
    src.on('peer', (...args) => swarms.emit('peer', ...args))
    src.on('error', (...args) => swarms.emit('error', ...args))
  }

  function onstream() {
    return cfs.replicate()
  }

  function onconnection(connection) {
    const stream = cfs.replicate({
      download: false,
      upload: true,
      live: true
    })

    pump(stream, connection, stream, (err) => {
      if (err) {
        debug(err)
      }
    })
  }
}

module.exports = {
  share
}
