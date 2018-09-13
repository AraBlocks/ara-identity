const { unpack, keyRing } = require('ara-network/keys')
const { createChannel } = require('ara-network/discovery/channel')
const { createSwarm } = require('ara-network/discovery/swarm')
const { Handshake } = require('ara-network/handshake')
const { createCFS } = require('cfsnet/create')
const { toHex } = require('./util')
const isBuffer = require('is-buffer')
const debug = require('debug')('ara:identity:archive')
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
 * @param {String} opts.keyring
 * @param {String} opts.network
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

  if ('string' !== typeof opts.secret && !isBuffer(opts.secret)) {
    throw new TypeError('Expecting shared secret to be a string or buffer.')
  }

  if (!opts.secret || 0 === opts.secret.length) {
    throw new TypeError('Shared secret cannot be empty.')
  }

  if (!opts.keyring) {
    throw new TypeError('Expecting network keys keyring.')
  }

  if (opts.name && 'string' === typeof opts.name && !opts.network) {
    const msg = 'Please set \'opts.network\' property instead of \'opts.name\'.'
    // eslint-disable-next-line no-console
    console.warn('aid.archive():', msg)
    // eslint-disable-next-line no-param-reassign
    opts.network = opts.name
  }

  if (-1 === opts.keyring.indexOf('.pub')) {
    debug(`Using keyring: ${opts.keyring}, which may not be a public keyring.`)
  }

  if (!opts.network || 'string' !== typeof opts.network) {
    throw new TypeError('Expecting network name for the archiver.')
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

  await keyring.ready()

  const buffer = await keyring.get(opts.network)
  const unpacked = unpack({ buffer })
  const { discoveryKey } = unpacked

  let peerCount = 0
  let didArchive = false
  let totalConnections = 0

  let channel = createChannel()
  let discovery = createSwarm({
    stream() {
      const stream = cfs.replicate({
        download: false,
        upload: true,
        live: false,
      })

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
    channel.once('error', reject)
    discovery.once('error', reject)
    discovery.once('close', resolve)
  })

  return didArchive

  function timeout(again) {
    clearTimeout(timeout.timer)
    if (false !== again) {
      timeout.timer = setTimeout(ontimeout, opts.timeout)
    }
  }

  function onpeer(chan, peer) {
    timeout()

    const socket = net.connect(peer.port, peer.host)
    const peerIndex = peerCount++
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

        if ('ACK' === data.toString()) {
          void totalConnections++
          didArchive = true
        } else {
          onerror(new Error('Archiver handshake failed.'))
        }

        timeout(false)
        reader.destroy()
        writer.destroy()
        socket.destroy()
        handshake.destroy()
      })
    }

    function onclose() {
      if (didArchive) {
        if (channel) {
          channel.destroy()
          channel = null
        }

        if (discovery) {
          discovery.destroy()
          discovery = null
        }

        if ('function' === typeof opts.onclose) {
          opts.onclose({
            totalConnections,
            discoveryKey,
            peerIndex,
            peer,
          })
        }
      }
    }
  }

  function onerror(err) {
    debug(err)
    if ('function' === typeof opts.onerror) {
      opts.onerror(err)
    }
  }

  function ontimeout() {
    clearTimeout(timeout)
    channel.emit('error', new Error('Archiver request timed out.'))
  }
}

module.exports = {
  archive
}
