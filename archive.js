const { unpack, keyRing } = require('ara-network/keys')
const { createChannel } = require('ara-network/discovery/channel')
const { createSwarm } = require('ara-network/discovery')
const { Handshake } = require('ara-network/handshake')
const { createCFS } = require('cfsnet/create')
const { toHex } = require('./util')
const pump = require('pump')
const ram = require('random-access-memory')
const net = require('net')

const kDefaultTimeout = 5000

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

  if (!opts.timeout) {
    // eslint-disable-next-line no-param-reassign
    opts.timeout = kDefaultTimeout
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

  const secret = Buffer.from(opts.secret)
  const keyring = keyRing(opts.keyring, { secret })
  const buffer = await keyring.get(opts.name)
  const unpacked = unpack({ buffer })
  const { discoveryKey } = unpacked

  let channel = createChannel()
  let discovery = createSwarm({
    stream() {
      const stream = cfs.replicate({ live: false })
      stream.on('error', onerror)
      return stream
    }
  })

  discovery.join(cfs.discoveryKey)

  channel.join(discoveryKey)
  channel.on('peer', onpeer)
  channel.on('error', onerror)

  timeout()

  await new Promise((resolve, reject) => {
    channel.once('close', resolve)
    channel.once('error', reject)
    discovery.once('error', reject)
  })

  return true

  function timeout(again) {
    clearTimeout(timeout.timer)
    if (false !== again) {
      timeout.timer = setTimeout(ontimeout, opts.timeout)
    }
  }

  function onpeer(chan, peer) {
    timeout()

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
    socket.on('close', onclose)

    function onhello(hello) {
      timeout()

      if ('function' === typeof opts.onhello) {
        opts.onhello(hello)
      }

      handshake.auth()
    }

    function onauth(auth) {
      timeout()

      if ('function' === typeof opts.onauth) {
        opts.onauth(auth)
      }
    }

    function onokay(okay) {
      timeout()

      if ('function' === typeof opts.onokay) {
        opts.onokay(okay)
      }

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
          channel.emit(
            'error',
            new Error('Archiver handshake failed.')
          )
        }

        timeout(false)
        reader.destroy()
        writer.destroy()
        socket.destroy()
        handshake.destroy()
      })
    }
  }

  function onerror(err) {
    if ('function' === typeof opts.onerror) {
      opts.onerror(err)
    }
  }

  function ontimeout() {
    clearTimeout(timeout)
    channel.emit(
      'error',
      new Error('Request timed out')
    )
  }

  function onclose() {
    if (channel) {
      channel.destroy()
      discovery.destroy()
    }

    if ('function' === typeof opts.onclose) {
      opts.onclose()
    }

    discovery = null
    channel = null
    return true
  }
}

module.exports = {
  archive
}
