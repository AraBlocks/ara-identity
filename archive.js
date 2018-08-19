const debug = require('debug')('ara-identity:archive')
const { error } = require('ara-console')
const { createChannel } = require('ara-network/discovery/channel')
const { createSwarm } = require('ara-network/discovery')
const { unpack, keyRing } = require('ara-network/keys')
const { Handshake } = require('ara-network/handshake')
const { createCFS } = require('cfsnet/create')
const ram = require('random-access-memory')
const { toHex } = require('./util')
const pkg = require('./package')
const pump = require('pump')
const net = require('net')

let channel = null
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

  if (undefined == opts.keyring) {
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


  let timeout = null
  clearTimeout(timeout)
  channel = createChannel()

  const secret = Buffer.from(opts.secret)
  const keyring = keyRing(opts.keyring, { secret })
  const buffer = await keyring.get(opts.name)
  const unpacked = unpack({ buffer })

  const { discoveryKey } = unpacked
  timeout = setTimeout(ontimeout, opts.timeout || 5000)
  channel.join(discoveryKey)
  channel.on('peer', onpeer)
  channel.on('error', onerror)

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

  function onpeer(connection, peer) {
    timeout = setTimeout(ontimeout, 5000)
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
        clearTimeout(timeout)
        if ('ACK' !== data.toString()) {
          channel.emit('error', 'Handshake with remote node failed, Exiting..')
        }
        connection.destroy(onclose)
      }))
    }
    return null
  }

  function onerror(err) {
    error('%s.archive :',pkg.name, err)
  }

  function ontimeout() {
    clearTimeout(timeout)
    throw new Error('Request timed out: Failed to contact peer to archive identity.')
    onclose()
  }

  function onclose() {
    if (channel) {
      channel.destroy()
    }
    return true
    channel = null
  }
}

module.exports = {
  archive
}
