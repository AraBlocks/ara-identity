const { unpack, keyRing } = require('ara-network/keys')
const { createChannel } = require('ara-network/discovery/channel')
const { createCFS } = require('cfsnet/create')
const { Handshake } = require('ara-network/handshake')
const { toHex } = require('./util')
const isBuffer = require('is-buffer')
const debug = require('debug')('ara:identity:archive')
const pump = require('pump')
const ram = require('random-access-memory')
const net = require('net')
const rc = require('./rc')()

const DEFAULT_ARCHIVER_CONNECTION_TIMEOUT = 5000
const DEFAULT_ARCHIVER_MAX_CONNECTIONS = 32

/**
 * Archive an identity into the network
 * @public
 * @param {Object} identity
 * @param {Object} opts
 * @param {String|Buffer} opts.secret
 * @param {String} opts.keyring
 * @param {String} opts.network
 * @param {Boolean} opts.shallow
 * @throws TypeError
 * @return {Promise}
 */
async function archive(identity, opts = {}) {
  if (null == identity || 'object' !== typeof identity) {
    throw new TypeError('Expecting identity to be an object.')
  }

  let conf
  try { conf = rc.network.identity.archiver } finally { conf = conf || {} }
  opts.secret = opts.secret || conf.secret
  opts.keyring = opts.keyring || conf.keyring
  opts.network = opts.network || conf.network

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
    opts.timeout = DEFAULT_ARCHIVER_CONNECTION_TIMEOUT
  }

  const { maxConnections = DEFAULT_ARCHIVER_MAX_CONNECTIONS } = opts
  const { publicKey, secretKey, files } = identity

  const secret = Buffer.from(opts.secret)
  const keyring = keyRing(opts.keyring, { secret })

  await keyring.ready()

  const buffer = await keyring.get(opts.network)
  const unpacked = unpack({ buffer })
  const { discoveryKey } = unpacked

  let peerCount = 0
  let didArchive = false
  let totalConnections = 0
  let activeConnections = 0

  let channel = createChannel()

  channel.join(discoveryKey)
  channel.on('peer', onpeer)
  channel.on('error', onerror)

  timeout()

  await new Promise((resolve, reject) => {
    channel.once('error', reject)
    channel.once('close', resolve)
  })

  return didArchive

  function timeout(again) {
    clearTimeout(timeout.timer)
    if (false !== again && false !== timeout.timer) {
      timeout.timer = setTimeout(ontimeout, opts.timeout)
    } else {
      timeout.timer = false
    }
  }

  function onpeer(chan, peer) {
    if (activeConnections >= maxConnections) {
      return
    }

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

    activeConnections++
    totalConnections++
    socket.on('error', onerror)
    socket.on('close', () => { activeConnections-- })
    handshake.pipe(socket).pipe(handshake)

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

    async function onokay(okay) {
      timeout()

      if ('function' === typeof opts.onokay) {
        opts.onokay(okay)
      }

      socket.pause()
      socket.unpipe(handshake).unpipe(socket)

      const proxy = await createCFS({
        storage: ram,
        shallow: true,
        key: publicKey,
        id: toHex(publicKey),
      })

      const cfs = await createCFS({
        secretKey,
        storage: ram,
        shallow: true,
        key: publicKey,
        id: toHex(publicKey),
      })

      const stream = proxy.replicate({ live: true })
      const shallow = opts.shallow || false

      await Promise.all(files.map((file) => {
        if (!shallow || 'ddo.json' === file.path) {
          return cfs.writeFile(file.path, file.buffer)
        }

        return {}
      }))

      timeout()

      const origin = cfs.replicate()
      const wire = proxy.replicate()
      let blocks = 0

      if (proxy.partitions.home.content) {
        oncontent()
      } else {
        proxy.partitions.home.once('content', oncontent)
      }

      pump(wire, origin, wire)

      function oncontent() {
        proxy.partitions.home.content.on('upload', onupload)
      }

      function onupload() {
        blocks++

        // each "upload" tick could be a "progress" event/callback :shrug:
        if (blocks === files.length) {
          process.nextTick(() => stream.end())
        }
      }

      pump(socket, stream, socket, (err) => {
        timeout(false)
        if (err) {
          onerror(err)
        } else {
          didArchive = true
        }
      })

      socket.resume()
    }

    function onclose() {
      if (didArchive) {
        if (channel) {
          channel.destroy()
          channel = null
        }
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

  function onerror(err) {
    totalConnections--
    debug(err)
    if (err && err.code !== 'ECONNREFUSED') {
      if ('function' === typeof opts.onerror) {
        opts.onerror(err)
      }
    }
  }

  function ontimeout() {
    channel.emit('error', new Error('Archiver request timed out.'))
  }
}

module.exports = {
  DEFAULT_ARCHIVER_CONNECTION_TIMEOUT,
  DEFAULT_ARCHIVER_MAX_CONNECTIONS,
  archive
}
