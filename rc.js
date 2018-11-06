const extend = require('extend')
const rc = require('ara-runtime-configuration')

const defaults = () => ({
  network: {
    identity: {
      archiver: { },
      resolver: { },
    },
  }
})

module.exports = conf => rc(extend(true, {}, defaults(), conf))
