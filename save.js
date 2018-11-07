const { writeIdentity } = require('./util')
const isBrowser = require('is-browser')

/**
 * High level function to save an identity to disk
 */
async function save(identity) {
  // @TODO(werle): Handle browser case for saving
  if (false === isBrowser) {
    await writeIdentity(identity)
    return true
  }

  return false
}

module.exports = {
  save
}
