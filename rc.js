const { resolve } = require('path')
const extend = require('extend')
const rc = require('ara-runtime-configuration')

const defaults = () => ({
  network: {
    identity: {
      root: resolve(rc().data.root, 'identities'),
      whoami: '',

      archiver: { },
      resolver: { },
    },
  }
})

module.exports = conf => rc(extend(true, {}, defaults(), conf))
