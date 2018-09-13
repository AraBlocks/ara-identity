/* eslint-disable no-await-in-loop */
const { resolve } = require('path')
const debug = require('debug')('ara:identity:list')
const pify = require('pify')
const fs = require('fs')
const rc = require('./rc')()

/**
 * Fetch a list of DID identities for ara stored locally on
 * the file system.
 *
 * @public
 * @param {?(String)} path
 * @return {Promise<Array>}
 * @throws TypeError
 */
async function list(path) {
  const identities = []
  const visits = []
  let entries = []

  if (undefined === path) {
    // eslint-disable-next-line no-param-reassign
    path = resolve(rc.network.identity.root)
  }

  try {
    entries = await pify(fs.readdir)(path)
  } catch (err) {
    throw new Error(`Cannot read identities directory '${path}'.`)
  }

  for (const entry of entries) {
    visits.push(pify(visit)(resolve(path, entry)))
  }

  // wait for all visits to resolve and then resolve the identities
  // array that each visit may append to
  await Promise.all(visits)
  return identities

  function visit(entry, cb) {
    const file = resolve(entry, 'ddo.json')
    debug('visit', file)
    fs.access(file, onaccess)
    function onaccess(err) {
      if (null === err) {
        fs.readFile(file, onread)
      } else {
        cb(null)
      }
    }

    function onread(err, buf) {
      if (err) {
        cb(err)
      } else {
        try {
          const { id } = JSON.parse(buf)

          if ('string' === typeof id) {
            identities.push(id)
          }

          cb(null)
        } catch (err2) {
          debug('list: visit: onread: error:', err2)
          cb(null)
        }
      }
    }
  }
}

module.exports = {
  list
}
