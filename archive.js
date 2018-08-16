const { createChannel } = require('ara-network/discovery/channel')
const { createSwarm } = require('ara-network/discovery')
const { unpack, keyRing } = require('ara-network/keys')
const { Handshake } = require('ara-network/handshake')
const { createCFS } = require('cfsnet/create')
const { info, warn } = require('ara-console')
const ram = require('random-access-memory')
const crypto = require('ara-crypto')
const inquirer = require('inquirer')
const { toHex } = require('./util')
const { resolve } = require('path')
const { readFile } = require('fs')
const { DID } = require('did-uri')
const pkg = require('./package')
const rc = require('./rc')()
const pify = require('pify')
const pump = require('pump')
const net = require('net')


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

  if (undefined == opts.secret) {
    throw new TypeError('ara-identity.archive: Expecting shared network secret')
  }

  if (undefined == opts.key) {
    throw new TypeError('ara-identity.archive: Expecting public network keys for the archiver node')
  }

  if (undefined == opts.name) {
    throw new TypeError('ara-identity.archive: Expecting name for the archiver nodes key ring')
  }

  const { publicKey, secretKey, files } = identity

  const cfs = await createCFS({
    secretKey,
    storage: ram,
    shallow: true,
    key: publicKey,
    id: toHex(publicKey),
  })

  await Promise.all(files.map(file => cfs.writeFile(file.path, file.buffer)))

  channel = createChannel()

  const secret = Buffer.from(opts.secret)
  const keyring = keyRing(opts.key, { secret })
  const buffer = await keyring.get(opts.name)
  const unpacked = unpack({ buffer })

  const { discoveryKey } = unpacked
  channel.join(discoveryKey)
  channel.on('peer', onpeer)

  await new Promise((resolve, reject) => {
    const discovery = createSwarm({
      stream() {
        const stream = cfs.replicate({ live: false })
        stream.once('end', _onend)
        return stream
      }
    })

    discovery.join(cfs.discoveryKey)
    discovery.once('error', _onend)

    function _onend(err) {
      if (err && err instanceof Error) { reject(err) } else { resolve() }
      discovery.destroy()
      return null
    }
  })

  return true

  function onpeer(channel, peer) {
    const socket = net.connect(peer.port, peer.host)
    const handshake = new Handshake({
      publicKey,
      secretKey,
      secret,
      remote: { publicKey: unpacked.publicKey },
      domain: { publicKey: unpacked.domain.publicKey }
    })

    pump(handshake, socket, handshake)

    handshake.hello()
    handshake.on('hello', onhello)
    handshake.on('auth', onauth)
    handshake.on('okay', onokay)

    function onhello() {
      handshake.auth()
    }

    function onauth() {
    }

    function onokay() {
      const writer = handshake.createWriteStream()
      const msg = Buffer.concat([cfs.key, cfs.discoveryKey, cfs.identifier])
      writer.write(msg)
      writer.end()
      const reader = handshake.createReadStream()
      reader.on('data', (async (data) => {
        handshake.destroy()
        channel.destroy(onclose)
      }))
    }

    function onclose() {
      return null
    }
  }
}

module.exports = {
  archive
}
