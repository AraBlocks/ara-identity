const { createIdentityKeyPath } = require('./key-path')
const { dirname, resolve } = require('path')
const isBuffer = require('is-buffer')
const mkdirp = require('mkdirp')
const pify = require('pify')
const dns = require('ara-identity-dns')
const fs = require('fs')
/* eslint-disable no-await-in-loop */

/**
 * Converts a buffer to a hex string.
 * @public
 * @param {Buffer} value
 * @return {String}
 */
function toHex(value) {
  if (Buffer.isBuffer(value)) {
    return value.toString('hex')
  } else if (value) {
    return toHex(Buffer.from(value))
  }
  return toHex(Buffer.from(0))
}

/**
 * Converts an ethereum style hex string into
 * a buffer. This function will return `null'
 * on input that is not a 'string' type.
 * @public
 * @param {String} hex
 * @return {Buffer|null}
 */
function ethHexToBuffer(hex) {
  if (hex && 'string' === typeof hex) {
    if ('0x' === hex.slice(0, 2)) {
      return Buffer.from(hex.slice(2), 'hex')
    }
    return Buffer.from(hex, 'hex')
  }
  return null
}

/**
 * Convert a value, however possible, to a buffer
 * @public
 * @param {Mixed} value
 * @return {Buffer}
 */
function toBuffer(value) {
  if (isBuffer(value)) {
    return value
  } else if (value && 'number' === typeof value) {
    return Buffer.alloc(value)
  } else if ('string' === typeof value) {
    return ethHexToBuffer(value)
  } else if (value) {
    return Buffer.from(value)
  }
  return Buffer.alloc(0)
}

/**
 * Write ARA Identity files to the root folder
 * @public
 * @param {Object} Identity
 */
async function writeIdentity(identity) {
  if (null == identity || 'object' !== typeof identity) {
    throw new TypeError('util.writeIdentity: Expecting object.')
  }

  if (null == identity.files || 'object' !== typeof identity.files) {
    throw new TypeError('util.writeIdentity: Expecting files object.')
  }

  const output = createIdentityKeyPath(identity)

  await pify(mkdirp)(output)

  for (let i = 0; i < identity.files.length; ++i) {
    const dir = dirname(resolve(output, identity.files[i].path))
    await pify(mkdirp)(dir)
    await pify(fs.writeFile)(
      resolve(output, identity.files[i].path),
      identity.files[i].buffer
    )
  }
}

async function resolveDNS(uri) {
  const resolution = await dns.resolve(uri)
  if (resolution && resolution.length) {
    if (resolution[0] && resolution[0].identifier) {
      return resolution[0].identifier
    }
  }

  return null
}

module.exports = {
  ethHexToBuffer,
  writeIdentity,
  resolveDNS,
  toBuffer,
  toHex,
}
