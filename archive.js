const { createIdentityKeyPath } = require('./key-path')
const { unpack, keyRing } = require('ara-network/keys')
const { createChannel } = require('ara-network/discovery/channel')
const { createCFS } = require('cfsnet/create')
const { Handshake } = require('ara-network/handshake')
const { toHex } = require('./util')
const isBuffer = require('is-buffer')
const messages = require('./protobuf/messages')
const crypto = require('ara-crypto')
const debug = require('debug')('ara:identity:archive')
const path = require('path')
const pump = require('pump')
const raf = require('random-access-file')
const net = require('net')
const rc = require('./rc')()

const DEFAULT_ARCHIVER_CONNECTION_TIMEOUT = 10000
const DEFAULT_ARCHIVER_MAX_CONNECTIONS = 32

/**
 * Archive an identity into the network
 * @public
 * @param {Object} identity Results from create(), { secretKey, publicKey, files }
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

  try {
    conf = {
      secret:
        rc.network.identity.archiver.secret || rc.network.identity.secret,

      keyring:
        rc.network.identity.archiver.keyring || rc.network.identity.keyring,

      network:
        rc.network.identity.archiver.network
    }
  } finally {
    conf = conf || {}
  }

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

  let keys = null
  let secret = null
  let channel = null
  let keyring = null
  let discoveryKey = null

  let peerCount = 0
  let didArchive = false
  let totalConnections = 0
  let activeConnections = 0

  const cfs = await createCFS({
    secretKey,
    storeSecretKey: false,
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

  const shallow = opts.shallow || false

  let writes = 0
  let blocks = 0

  await Promise.all(files.map(async (file) => {
    if (!shallow || 'ddo.json' === file.path) {
      let doWrite = true

      try {
        await cfs.access(file.path)
        const buf = await cfs.readFile(file.path)
        if (0 === Buffer.compare(buf, file.buffer)) {
          doWrite = false
        }
      } catch (err) {
        debug(err)
      }

      if (doWrite) {
        return cfs.writeFile(file.path, file.buffer)
      }
    }

    return null
  }))

  if (true !== opts.local) {
    secret = Buffer.from(opts.secret)
    keyring = keyRing(opts.keyring, { secret })
    channel = createChannel()

    await keyring.ready()

    const buffer = await keyring.get(opts.network)
    keys = unpack({ buffer })
    // eslint-disable-next-line prefer-destructuring
    discoveryKey = keys.discoveryKey

    channel.join(discoveryKey)
    channel.on('peer', onpeer)
    channel.on('error', onerror)

    timeout()

    await new Promise((resolve, reject) => {
      channel.once('error', reject)
      channel.once('close', resolve)
    })
  } else {
    await cfs.close()
    didArchive = true
  }

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
      remote: { publicKey: keys.publicKey },
      domain: { publicKey: keys.domain.publicKey }
    })

    activeConnections++
    totalConnections++

    socket.on('error', onerror)
    socket.on('close', onclose)
    socket.on('close', () => {
      activeConnections = Math.max(activeConnections - 1, 0)
    })

    handshake.on('error', onerror)
    handshake.on('hello', onhello)
    handshake.on('auth', onauth)
    handshake.on('okay', onokay)

    handshake.hello()
    handshake.pipe(socket).pipe(handshake)

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

      timeout()
      socket.pause()
      socket.unpipe(handshake).unpipe(socket)

      const key = publicKey
      const signature = crypto.sign(
        crypto.blake2b(messages.Archive.encode({ shallow, key })),
        secretKey
      )

      const stream = cfs.replicate({
        download: false,
        upload: true,
        live: true,

        userData: messages.Archive.encode({
          signature,
          shallow,
          key,
        })
      })

      let pending = 0

      timeoutLiveConnection()

      function timeoutLiveConnection(again) {
        clearTimeout(timeoutLiveConnection.timer)
        if (false !== again) {
          timeoutLiveConnection.timer = setTimeout(() => stream.end(), 500)
        } else {
          timeoutLiveConnection.timer = false
        }
      }

      cfs.partitions.home.content.on('peer-add', () => {
        timeoutLiveConnection(false)
        pending++
      })

      cfs.partitions.home.content.on('peer-remove', () => {
        timeoutLiveConnection(false)
        if (0 === --pending) {
          process.nextTick(() => stream.end())
        }
      })

      if (cfs.partitions.home.content) {
        oncontent()
      } else {
        cfs.partitions.home.once('content', oncontent)
      }

      function oncontent() {
        cfs.partitions.home.content.on('upload', onupload)
      }

      cfs.partitions.home.metadata.on('upload', () => {
        writes++
        timeoutLiveConnection(false)
      })

      function onupload() {
        timeoutLiveConnection()
        blocks++

        if ('function' === typeof opts.onupload) {
          opts.onupload({
            peerIndex,
            blocks,
            writes,
            peer,
          })
        }
      }

      pump(socket, stream, socket, (err) => {
        timeout(false)
        if (err) { debug(err) }
        if (err && !ignoredError(err)) {
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
          activeConnections,
          totalConnections,
          discoveryKey,
          peerIndex,
          peer,
        })
      }
    }
  }

  function onerror(err) {
    totalConnections = Math.max(totalConnections - 1, 0)
    debug(err)
    if (err && !ignoredError(err)) {
      if ('function' === typeof opts.onerror) {
        opts.onerror(err)
      }
    }
  }

  function ontimeout() {
    channel.emit('error', new Error('Archiver request timed out.'))
  }

  function ignoredError(err) {
    return Boolean(err && [
      'ECONNREFUSED',
      'EPIPE'
    ].includes(err.code))
  }
}

module.exports = {
  DEFAULT_ARCHIVER_CONNECTION_TIMEOUT,
  DEFAULT_ARCHIVER_MAX_CONNECTIONS,
  archive
}
