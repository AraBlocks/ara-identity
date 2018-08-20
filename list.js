/* eslint-disable no-await-in-loop */
const { resolve } = require('path')
const pify = require('pify')
const fs = require('fs')
const rc = require('./rc')()

/**
 * Fetch a list Identities stored locally
 * @public
 * @param {String} path (Optional)
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
          cb(err2)
        }
      }
    }
  }
}

module.exports = {
  list
}
