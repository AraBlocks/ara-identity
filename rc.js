const extend = require('extend')
const rc = require('ara-runtime-configuration')

const defaults = () => ({
  network: {
    identity: {
      whoami: '',

      archiver: { },
      resolver: { },
    },
  }
})

module.exports = conf => rc(extend(true, {}, defaults(), conf))
