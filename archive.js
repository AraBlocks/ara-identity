'use strict'

const { createNetwork } = require('ara-identity-archiver/network')
const through = require('through2')
const secrets = require('ara-network/secrets')
const crypto = require('ara-crypto')
const pump = require('pump')
const pify = require('pify')
const lpm = require('length-prefixed-message')
const fs = require('fs')

/**
 *
 */
async function archive(identity, opts) {
  if (null == identity || 'object' != typeof identity) {
    throw new TypeError("ara-identity.archiver.archive: Expecting identity object.")
  }

  if (null == opts || 'object' != typeof opts) {
    throw new TypeError("ara-opts.archiver.archive: Expecting options object.")
  }

  // @TODO(jwerle): Remove this
  const keystore = JSON.parse(await pify(fs.readFile)('keystore.pub'))
  const key = Buffer.alloc(16).fill('hello')


  const { cfs } = identity
  const { discoveryKey, client, remote } = secrets.decrypt({keystore}, {key})
  const network = await createNetwork({
    network: {key: discoveryKey},
    onstream,
    remote, client,
  })

  network.swarm.setMaxListeners(Infinity)
  network.swarm.listen(0, () => {
    network.swarm.join(discoveryKey)
  })

  // @TODO(jwerle): Remove this
  await new Promise((resolve) => {
    console.log('close');
    network.swarm.once('close', resolve)
  })

  return network

  function onstream(connection, info) {
    const idx = Buffer.concat([Buffer.from('idx'), cfs.identifier])
    const pkx = Buffer.concat([Buffer.from('pkx'), cfs.key])

    lpm.write(connection, pkx)
    connection.once('readable', () => lpm.read(connection, onpkx))

    function onpkx(hash) {
      const signature = crypto.blake2b(pkx)
      if (0 == Buffer.compare(hash, signature)) {
        lpm.write(connection, idx)
        connection.once('readable', () => lpm.read(connection, onidx))
      } else {
        throw new Error("pdx hash did not match signature.")
      }
    }

    function onidx(hash) {
      const signature = crypto.blake2b(idx)
      if (0 == Buffer.compare(hash, signature)) {
        lpm.write(connection, Buffer.from([0xdef])) // magic terminating byte
        connection.once('readable', () => lpm.read(connection, onack))
      } else {
        throw new Error("idx hash did not match signature.")
      }
    }

    function onack(hash) {
      const signature = crypto.blake2b(Buffer.concat([pkx, idx]))
      if (0 == Buffer.compare(hash, signature)) {
        const stream = cfs.replicate({upload: true, download: false})
        pump(connection, stream, connection, (err) => {
          network.swarm.close()
        })
      } else {
        throw new Error("ack hash did not match signature.")
      }
    }
  }
}

module.exports = {
  archive
}
