const isDomainName = require('is-domain-name')
const { resolve } = require('./resolve')
const { update } = require('./update')
const { DID } = require('did-uri')
const dns = require('ara-identity-dns')

const RFC4501 = 'RFC4501'
const DNS_SERVICE_TYPE = 'DNSURIRecord'

async function query(domain, opts) {
  const resolutions = await dns.resolve(domain, opts)
  return resolutions
}

async function bind(identifier, domain, opts) {
  if (!isDomainName(domain)) {
    throw new TypeError(`Expecting '${domain}' to be a valid domain name.`)
  }

  const ddo = opts.ddo || await resolve(identifier, opts)
  let isBound = false

  for (const service of ddo.service) {
    if (DNS_SERVICE_TYPE === service.type || RFC4501 === service.type) {
      const p = service.id.split(';')
      const { did } = new DID(p[0])
      const name = p[1]
      if (did === ddo.id && name === domain) {
        isBound = true
        break
      }
    }
  }

  if (isBound) {
    throw new Error(`Domain '${domain}' is already bound to identity.`)
  }

  const authority = opts.authority ? `//${opts.authority}/` : ''

  ddo.service.push({
    id: `${ddo.id};${domain}`,
    type: DNS_SERVICE_TYPE,
    serviceEndpoint: `dns://${authority}${domain}?type=${opts.type || 'TXT'}`
  })

  return update(ddo.id, {
    password: opts.password,
    publicKey: opts.publicKey,
    secretKey: opts.secretKey,
    ddo,
  })
}

async function unbind(identifier, domain, opts) {
  if (!isDomainName(domain)) {
    throw new TypeError(`Expecting '${domain}' to be a valid domain name.`)
  }

  const ddo = opts.ddo || await resolve(identifier, opts)
  let wasBound = false

  for (let i = 0; i < ddo.service.length; ++i) {
    const service = ddo.service[i]
    if (DNS_SERVICE_TYPE === service.type || RFC4501 === service.type) {
      const p = service.id.split(';')
      const { did } = new DID(p[0])
      const name = p[1]

      if (did === ddo.id && name === domain) {
        ddo.service.splice(i, 1)
        wasBound = true
        break
      }
    }
  }

  if (wasBound) {
    return update(ddo.id, {
      password: opts.password,
      publicKey: opts.publicKey,
      secretKey: opts.secretKey,
      ddo,
    })
  }

  throw new Error(`Domain '${domain}' not bound to identity.`)
}

module.exports = {
  resolve,
  unbind,
  query,
  bind,
}
