const { createSwarm } = require('ara-network/discovery')
const { destroyCFS } = require('cfsnet/destroy')
const { createCFS } = require('cfsnet/create')
const { normalize } = require('./did')
const { resolve } = require('path')
const { toHex } = require('./util')
const { DID } = require('did-uri')
const crypto = require('ara-crypto')
const pify = require('pify')
const pump = require('pump')
const ram = require('random-access-memory')
const rc = require('./rc')()
const fs = require('fs')

const DISCOVERY_TIMEOUT = 5 * 1000

/**
 * Joins a network swarm for an identity scoped to a given
 * filename.
 * @private
 * @param {String} identifier
 * @param {String} filename
 * @param {?(Object)} opts
 * @param {Function} onjoin
 * @return {Promise}
 */
async function joinNetwork(identifier, filename, opts, onjoin) {
  return pify(async (done) => {
    const did = new DID(normalize(identifier))
    const cfs = await createCFS({
      shallow: true,
      storage: () => ram(),
      sparse: true,
      key: Buffer.from(did.identifier, 'hex'),
      id: did.identifier,
    })

    const swarm = createSwarm({ })
    let timeout = setTimeout(ontimeout, DISCOVERY_TIMEOUT)

    swarm.join(cfs.discoveryKey)
    swarm.on('connection', onconnection)
    swarm.on('error', onerror)
    cfs.once('sync', onupdate)
    cfs.update(onupdate)

    async function close(err, result) {
      try {
        await destroyCFS({ cfs })
        done(err, result)
      } catch (err2) {
        done(err2, result)
      }
    }

    function onerror(err) {
      clearTimeout(timeout)
      close(err)
    }

    function ontimeout() {
      close(new NoEntitityError(filename, 'open'))
    }

    function onconnection(connection, peer) {
      void peer
      clearTimeout(timeout)
      timeout = setTimeout(ontimeout, DISCOVERY_TIMEOUT)

      const stream = cfs.replicate({
        download: true,
        upload: true,
        live: false,
      })

      stream.on('error', onerror)
      pump(connection, stream, connection)
    }

    function onupdate() {
      clearTimeout(timeout)
      timeout = setTimeout(ontimeout, DISCOVERY_TIMEOUT)
      onjoin(cfs, did, (err, result) => {
        clearTimeout(timeout)
        close(err, result)
      })
    }
  })()
}

/**
 * Resolves a filename path for an identity based on
 * a given identifier.
 * @private
 * @param {String} identifier
 * @param {String} filename
 * @return {String}
 */
function resolvePath(identifier, filename) {
  const did = new DID(normalize(identifier))
  const hash = toHex(crypto.blake2b(Buffer.from(did.identifier, 'hex')))
  return resolve(rc.network.identity.root, hash, filename)
}

async function readFile(identifier, filename, opts) {
  const skipCache = Boolean(opts && false === opts.cache)
  if (false === skipCache) {
    try {
      const path = resolvePath(identifier, filename)
      return await pify(fs.readFile)(path, opts)
    } catch (err) {
      void err
    }
  }

  return joinNetwork(identifier, filename, opts, onjoin)

  async function onjoin(cfs, did, done) {
    try {
      done(null, await cfs.readFile(filename))
    } catch (err) {
      done(new NoEntitityError(filename, 'open'))
    }
  }
}

/**
 * Write a filename for an identity based on a given identifier
 *
 * @public
 * @param {String} identifier
 * @param {String} filename
 * @param {Buffer} buffer
 * @param {?(Object)} opts
 * @return {Promise}
 */
async function writeFile(identifier, filename, buffer, opts) {
  const path = resolvePath(identifier, filename)
  return pify(fs.writeFile)(path, buffer, opts)
}

async function stat(identifier, filename, opts) {
  if (!opts || false !== opts.cache) {
    const path = resolvePath(identifier, filename)
    try {
      return await pify(fs.stat)(path, opts)
    } catch (err) {
      void err
    }
  }

  return joinNetwork(identifier, filename, opts, onjoin)

  async function onjoin(cfs, did, done) {
    try {
      done(null, await cfs.stat(filename))
    } catch (err) {
      done(new NoEntitityError(filename, 'stat'))
    }
  }
}

async function lstat(identifier, filename, opts) {
  if (!opts || false !== opts.cache) {
    const path = resolvePath(identifier, filename)
    try {
      return await pify(fs.lstat)(path, opts)
    } catch (err) {
      void err
    }
  }

  return joinNetwork(identifier, filename, opts, onjoin)

  async function onjoin(cfs, did, done) {
    try {
      done(null, await cfs.lstat(filename))
    } catch (err) {
      done(new NoEntitityError(filename, 'lstat'))
    }
  }
}

async function access(identifier, filename, opts) {
  if (!opts || false !== opts.cache) {
    try {
      const path = resolvePath(identifier, filename)
      return await pify(fs.access)(path)
    } catch (err) {
      void err
    }
  }

  return joinNetwork(identifier, filename, opts, onjoin)

  async function onjoin(cfs, did, done) {
    try {
      done(null, await cfs.access(filename))
    } catch (err) {
      done(new NoEntitityError(filename, 'access'))
    }
  }
}

async function readdir(identifier, filename, opts) {
  if (!opts || false !== opts.cache) {
    try {
      const path = resolvePath(identifier, filename)
      return await pify(fs.readdir)(path, opts)
    } catch (err) {
      void err
    }
  }

  return joinNetwork(identifier, filename, opts, onjoin)

  async function onjoin(cfs, did, done) {
    try {
      done(null, await cfs.readdir(filename, opts))
    } catch (err) {
      done(new NoEntitityError(filename, 'scandir'))
    }
  }
}

class NoEntitityError extends Error {
  constructor(path, call) {
    super(`ENOENT: no such file or directory, ${call} '${path}'`)
    this.errno = -2
    this.code = 'ENOENT'
    this.syscall = call
    this.path = path
  }
}

module.exports = {
  writeFile,
  readFile,
  readdir,
  access,
  lstat,
  stat,
}
