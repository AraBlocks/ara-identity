/* eslint-disable no-await-in-loop */
const { createSwarm } = require('ara-network/discovery')
const { createCFS } = require('cfsnet/create')
const { toHex } = require('./util')
const { DID } = require('did-uri')
const pify = require('pify')
const ram = require('random-access-memory')

const kDIDIdentifierLength = 64
// in milliseconds
const kDefaultTimeout = 10000

/**
 * Replicate & Download a DID's identity files from a remote server
 * @public
 * @param {String} identity
 * @param {Object} opts
 * @param {String} opts.timeout (optional)
 * @return {Object}
 */

async function replicate(identity, opts) {
  if (null === identity || 'string' !== typeof identity) {
    throw new TypeError('Expecting a valid identity string to replicate.')
  }

  if (0 !== identity.indexOf('did:ara:')) {
    // eslint-disable-next-line no-param-reassign
    identity = `did:ara:${identity}`
  }

  const did = new DID(identity)

  if (!did.identifier || kDIDIdentifierLength !== did.identifier.length) {
    throw new TypeError('Invalid DID identifier length.')
  }

  if (!opts.timeout) {
    // eslint-disable-next-line no-param-reassign
    opts.timeout = kDefaultTimeout
  }

  const value = await findFiles(did, opts)
  return value
}

async function findFiles(did, opts) {
  let timeout = null

  return pify(async (done) => {
    timeout = setTimeout(onexpire, opts.timeout)
    const key = Buffer.from(did.identifier, 'hex')
    const id = toHex(key)

    const cfs = await createCFS({
      key,
      id,
      sparseMetadata: true,
      shallow: true,
      storage: ram,
      sparse: true,
    })

    cfs.discovery = createSwarm({
      stream: () => cfs.replicate()
    })

    cfs.discovery.once('connection', () => setTimeout(onexpire, opts.timeout))
    cfs.discovery.once('connection', () => clearTimeout(timeout))
    cfs.discovery.once('connection', onconnection)
    cfs.discovery.join(cfs.discoveryKey)

    async function onconnection() {
      await new Promise(resolve => cfs.once('update', resolve))
      try {
        let ddo
        const identityFiles = []
        const files = await cfs.readdir('.')
        for (const file of files) {
          if ('keystore' === file) {
            const ethKeystore = await cfs.readFile('keystore/eth')
            const araKeystore = await cfs.readFile('keystore/ara')
            identityFiles.push({
              path: 'keystore/eth',
              buffer: ethKeystore
            }, {
              path: 'keystore/ara',
              buffer: araKeystore
            })
          } else {
            const content = await cfs.readFile(file)
            if ('ddo.json' === file) {
              ddo = JSON.parse(content.toString('utf8'))
            }
            identityFiles.push({
              path: file,
              buffer: content
            })
          }
        }
        const response = {
          publicKey: Buffer.from(did.identifier),
          files: identityFiles,
          ddo,
          did
        }
        done(null, response)
        onclose()
      } catch (err) {
        done(new Error(err))
      }
    }
    return null

    async function onclose() {
      if (cfs && cfs.discovery) {
        cfs.discovery.destroy()
        cfs.discovery = null
      }
    }

    async function onexpire() {
      clearTimeout(timeout)
      done(new Error('Could not replicate DID from peer. Request Timed out'))
    }
  })()
}

module.exports = {
  replicate
}
