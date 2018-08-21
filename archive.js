const { unpack, keyRing } = require('ara-network/keys')
const { createChannel } = require('ara-network/discovery/channel')
const { createSwarm } = require('ara-network/discovery')
const { Handshake } = require('ara-network/handshake')
const { createCFS } = require('cfsnet/create')
const { error } = require('ara-console')
const { toHex } = require('./util')
const pump = require('pump')
const pkg = require('./package.json')
const ram = require('random-access-memory')
const net = require('net')

/**
 * Archive an identity into the network
 * @public
 * @param {Object} identity
 * @param {Object} opts
 * @param {String|Buffer} opts.secret
 * @param {Strin} opts.keyring
 * @param {String} opts.name
 * @throws TypeError
 * @return {Promise}
 */
async function archive(identity, opts) {
  if (null == identity || 'object' !== typeof identity) {
    throw new TypeError('Expecting identity to be an object.')
  }

  if (null == opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting options to be an object.')
  }

  if (!opts.secret) {
    throw new TypeError('Expecting shared secret to be a string or buffer.')
  }

  if (!opts.keyring) {
    throw new TypeError('Expecting public network keys for the archiver node')
  }

  if (!opts.name || 'string' !== typeof opts.name) {
    throw new TypeError('Expecting name for the archiver nodes key ring')
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

  let channel = createChannel()
  let timeout = null

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
        stream.once('end', onend)
        return stream
      }
    })

    discovery.join(cfs.discoveryKey)
    discovery.once('error', onend)

    function onend(err) {
      if (err && err instanceof Error) {
        reject(err)
      } else {
        resolve()
      }

      discovery.destroy()
      return null
    }
  })

  return true

  function onpeer(connection, peer) {
    // timeout = setTimeout(ontimeout, opts.timeout || 5000)
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
      const reader = handshake.createReadStream()
      const writer = handshake.createWriteStream()
      const msg = Buffer.concat([
        cfs.key,
        cfs.discoveryKey,
        cfs.identifier
      ])

      writer.end(msg)

      reader.once('data', (data) => {
        clearTimeout(timeout)

        if ('ACK' !== data.toString()) {
          channel.emit('error', new Error('Handshake with remote node failed, Exiting..'))
        }

        channel.destroy(onclose)
      })
    }
  }

  function onerror(err) {
    error('%s.archive :', pkg.name, err)
  }

  function ontimeout() {
    clearTimeout(timeout)
    channel.emit('error', new Error('Request timed out: Failed to contact peer to archive identity.'))
  }

  function onclose() {
    if (channel) {
      channel.destroy()
    }
    channel = null
    return true
  }
}

module.exports = {
  archive
}
