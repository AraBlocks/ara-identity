const { info, warn } = require('ara-console')
const { resolve } = require('path')
const rc = require('./rc')()
const fs = require('fs')

/**
 * Fetch a list Identities stored locally
 * @public
 * @param {String} path (Optional)
 */
function list(path) {
  const identities = []
  if (undefined === path) {
    path = resolve(rc.network.identity.root)
  }
  let folders = []
  try { folders = fs.readdirSync(path) }
  catch (err) { throw new Error(`Cannot read directory ${path}`) }

  folders.forEach((folder) => {
    let files = []
    let data = null
    folder = resolve(path, folder)

    try { files = fs.readdirSync(folder) }
    catch (err) { throw new Error(`Cannot read directory ${folder}`) }

    if (files.indexOf('ddo.json') > -1) {
      try { data = fs.readFileSync(resolve(folder, 'ddo.json')) }
      catch (err) { new Error('Cannot read ddo.json') }

      try { identities.push(JSON.parse(data).id) }
      catch (err) { throw new Error('Cannot parse ddo.json') }
    }
  })
  return identities
}

module.exports = {
  list
}
