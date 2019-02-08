const { resolve } = require('ara-identity-dns')

async function query(domain, opts) {
  const resolutions = await resolve(domain, opts)
  return resolutions
}

async function bind(identity, domain, opts) {
  // const ddo = await resolve(identity, opts)
  void opts
  console.warn('aid.dns.bind() is not implemented')
  return false
}

module.exports = {
  resolve,
  query,
  bind,
}
