const { createChannel, createSwarm } = require('ara-network/discovery')
const { unpack, keyRing } = require('ara-network/keys')
const { info, warn } = require('ara-console')
const { createCFS } = require('cfsnet/create')
const { toHex } = require('./util')
const isBuffer = require('is-buffer')
const { DID } = require('did-uri')
const debug = require('debug')('ara:identity:replicate')
const pump = require('pump')
const pify = require('pify')
const ram = require('random-access-memory')
const net = require('net')

const kDIDIdentifierLength = 64
// in milliseconds
const kDefaultTimeout = 5000
const kDIDMethod = 'ara'

/**
 * Replicate & Download a DID's identity files from a remote server
 * @public
 * @param {String} identity
 * @param {Object} opts
 * @param {String} opts.keyring
 * @param {String} opts.network
 * @param {String} opts.secret
 */

async function replicate(identity, opts) {
  if (null === identity || 'string' !== typeof identity) {
    throw new TypeError('Expecting a valid identity string to replicate.')
  }

  if (0 !== identity.indexOf('did:ara:')) {
    // eslint-disable-next-line no-param-reassign
    identity = `did:ara:${identity}`
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

  if (!opts.timeout) {
    // eslint-disable-next-line no-param-reassign
    opts.timeout = kDefaultTimeout
  }

  const did = new DID(identity)

  if (kDIDMethod !== did.method) {
    throw new TypeError(`Invalid DID method (${did.method}). ` +
      `Expecting 'did:${kDIDMethod}:...'.`)
  }

  if (!did.identifier || kDIDIdentifierLength !== did.identifier.length) {
    throw new TypeError('Invalid DID identifier length.')
  }

  const secret = Buffer.from(opts.secret)
  const keyring = keyRing(opts.keyring, { secret })
  keyring.on('error', (err) => {
    throw new Error(err)
  })
  keyring.ready()
  const buffer = await keyring.get(opts.network)
  const unpacked = unpack({ buffer })
  const { discoveryKey } = unpacked

  timeout = setTimeout(ontimeout, opts.timeout)
  const value = await findFiles()
  return value

  async function findFiles() {
    let channel = createChannel()

    return pify((done) => {
      channel.on('peer', onpeer)
      channel.join(discoveryKey)
      async function onpeer() {
        const key = Buffer.from(did.identifier, 'hex')
        const id = toHex(key)

        const ttl = 1000 * 60
        const cfs = await createCFS({
          key,
          id,
          sparseMetadata: true,
          shallow: true,
          // @TODO(jwerle): Figure out an on-disk cache
          storage: ram,
          sparse: true,
        })

        cfs.discovery = createSwarm({
          stream: () => cfs.replicate(),
          utp: false
        })

        cfs.discovery.once('connection', onconnection)
        cfs.discovery.join(cfs.discoveryKey)

        async function onconnection() {
          try {
            await cfs.access('.')
          } catch (err) {
            await new Promise(done => cfs.once('update', done))
          }

          try{
            let identityFiles = {}
            await cfs.download('.')
            const files = await cfs.readdir('.')
            for (const file of files) {
              try{
                if (file == 'keystore') {
                  const ethKeystore = await cfs.readFile('keystore/eth')
                  const araKeystore = await cfs.readFile('keystore/ara')
                  identityFiles['keystore/eth'] = ethKeystore.toString('utf8')
                  identityFiles['keystore/ara'] = araKeystore.toString('utf8')
                }
                else {
                  const buffer = await cfs.readFile(file)
                  identityFiles[file] = buffer.toString('utf8')
                }
              } catch(err) {
                console.log(err)
              }
            }
            done(null, identityFiles)
          } catch(err) {
            throw new Error(err)
          }
        }
      }
    })()
  }

  async function ontimeout() {
    clearTimeout(timeout)
    debug('Request timed out')
    throw new TypeError('Request Timed out')
    onclose()
  }

  async function onclose() {
    if (cfs && cfs.discovery) {
      cfs.discovery.destroy()
      cfs.discovery = null
    }
    channel.destroy()
  }
}

async function findFiles(did, discoveryKey) {
  let channel = createChannel()

  return pify((done) => {
    channel.on('peer', onpeer)
    channel.join(discoveryKey)
    async function onpeer() {
      const key = Buffer.from(did.identifier, 'hex')
      const id = toHex(key)

      const ttl = 1000 * 60
      const cfs = await createCFS({
        key,
        id,
        sparseMetadata: true,
        shallow: true,
        // @TODO(jwerle): Figure out an on-disk cache
        storage: ram,
        sparse: true,
      })

      cfs.discovery = createSwarm({
        stream: () => cfs.replicate(),
        utp: false
      })

      cfs.discovery.once('connection', onconnection)
      cfs.discovery.join(cfs.discoveryKey)

      async function onconnection() {
        try {
          await cfs.access('.')
        } catch (err) {
          await new Promise(done => cfs.once('update', done))
        }

        try{
          let identityFiles = {}
          await cfs.download('.')
          const files = await cfs.readdir('.')
          for (const file of files) {
            try{
              if (file == 'keystore') {
                const ethKeystore = await cfs.readFile('keystore/eth')
                const araKeystore = await cfs.readFile('keystore/ara')
                identityFiles['keystore/eth'] = ethKeystore.toString('utf8')
                identityFiles['keystore/ara'] = araKeystore.toString('utf8')
              }
              else {
                const buffer = await cfs.readFile(file)
                identityFiles[file] = buffer.toString('utf8')
              }
            } catch(err) {
              console.log(err)
            }
          }
          done(null, identityFiles)
        } catch(err) {
          throw new Error(err)
        }
      }
    }
  })()
}


module.exports = {
  replicate
}
