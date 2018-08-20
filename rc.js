const { resolve } = require('path')
const extend = require('extend')
const rc = require('ara-runtime-configuration')

const defaults = () => ({
  network: {
    identity: {
      root: resolve(rc().data.root, 'identities'),
      keystore: resolve(rc().data.root, 'identities', 'keystore'),
      ethKeystore: resolve(rc().data.root, 'identities', 'keystore', 'eth'),
      araKeystore: resolve(rc().data.root, 'identities', 'keystore', 'ara'),
      archive: {
        root: resolve(rc().data.root, 'identities', 'archive'),
      }
    }
  }
})

module.exports = conf => rc(extend(true, {}, defaults(), conf))
