const { unpack, keyRing } = require('ara-network/keys')
const { createChannel } = require('ara-network/discovery/channel')
const { Handshake } = require('ara-network/handshake')
const { toHex } = require('./util')
const isBuffer = require('is-buffer')
const crypto = require('ara-crypto')
const debug = require('debug')('ara:identity:archive')
const split = require('split-buffer')
const pump = require('pump')
const ram = require('random-access-memory')
const net = require('net')
const rc = require('./rc')()
const fs = require('fs')

const kDefaultTimeout = 5000

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
    opts.timeout = kDefaultTimeout
  }

  const { publicKey, secretKey, files } = identity

  let identityFile = null

  files.forEach((file) => {
    if ('identity' === file.path){
      identityFile = file.buffer
    }
  })

  const secret = Buffer.from(opts.secret)
  const keyring = keyRing(opts.keyring, { secret })

  await keyring.ready()

  const peers = []
  const buffer = await keyring.get(opts.network)
  const unpacked = unpack({ buffer })
  const { discoveryKey } = unpacked

  let peerCount = 0
  let didArchive = false
  let totalConnections = 0

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

    //handshake.pipe(socket).pipe(handshake)
    pump(handshake, socket, handshake)

    handshake.hello()
    handshake.on('hello', onhello)
    handshake.on('auth', onauth)
    handshake.on('okay', onokay)
    socket.on('close', onclose)

    function onhello(hello) {
      try {
        const key = Buffer.concat([ hello.publicKey, hello.mac ])
        const id = crypto.shash(key, secretKey.slice(0, 16)).toString('hex')

        if (peers.includes(id)) {
          timeout(false)
          socket.destroy()
          handshake.destroy()
          return
        }

        peers.push(id)
      } catch (err) {
        debug(err)
      }

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

      const writer = handshake.createWriteStream()
      console.log(identityFile.length)
      const parts = split(identityFile, 64)
      parts.forEach((part)=>{
        process.nextTick(() => writer.write(part))
      })
      //writer.end()
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
    debug(err)
    if ('function' === typeof opts.onerror) {
      opts.onerror(err)
    }
  }

  function ontimeout() {
    channel.emit('error', new Error('Archiver request timed out.'))
  }
}

module.exports = {
  archive
}
