/* eslint-disable no-await-in-loop */
const { resolve } = require('path')
const rc = require('./rc')()
const pify = require('pify')
const fs = require('fs')

/**
 * Fetch a list Identities stored locally
 * @public
 * @param {String} path (Optional)
 */
async function list(path) {
  const identities = []
  let folders = []

  if (undefined === path) {
    // eslint-disable-next-line no-param-reassign
    path = resolve(rc.network.identity.root)
  }

  try {
    folders = await pify(fs.readdir)(path)
  } catch (err) {
    throw new Error(`Cannot read directory ${path}`)
  }

  for (const key in folders) {
    let files = []
    let data = null
    const folder = resolve(path, folders[key])
    try {
      files = await pify(fs.readdir)(folder)
    } catch (err) {
      throw new Error(`Cannot read directory ${folder}`)
    }

    if (files.indexOf('ddo.json') > -1) {
      try {
        data = await pify(fs.readFile)(resolve(folder, 'ddo.json'))
      } catch (err) {
        throw new Error('Cannot read ddo.json')
      }

      try {
        identities.push(JSON.parse(data).id)
      } catch (err) {
        throw new Error('Cannot parse ddo.json')
      }
    }
  }

  return identities
}

module.exports = {
  list
}
