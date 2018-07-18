const { resolve } = require('path')
const extend = require('extend')
const rc = require('ara-runtime-configuration')

require('ara-identity-archiver/rc')()

const defaults = () => ({
  network: {
    identity: {
      root: resolve(rc().data.root, 'identities'),
      eth: resolve(rc().data.root, 'identities', 'keystore')
    }
  }
})

module.exports = conf => rc(extend(true, {}, defaults(), conf))
