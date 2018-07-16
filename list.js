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
  if (undefined !== path && !fs.existsSync(path)) {
    throw new TypeError('Specified folder does not exist')
  }
  if (undefined === path) {
    path = resolve(rc.network.identity.root)
  }
  info('Fetching Identities from disc')
  try {
    const folders = fs.readdirSync(path)
    folders.forEach((folder) => {
      const files = fs.readdirSync(resolve(path, folder))
      if (files.indexOf('ddo.json') > -1) {
        const data = fs.readFileSync(resolve(path, folder, 'ddo.json'))
        identities.push(JSON.parse(data).id)
      }
    })
  } catch (err) {
    warn(err)
  }
  return identities
}

module.exports = {
  list
}
