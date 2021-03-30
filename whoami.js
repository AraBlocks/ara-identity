const isDomainName = require('is-domain-name')

const { resolveDNS } = require('./util')
const { normalize } = require('./did')
const { resolve } = require('./resolve')
const rc = require('./rc')()

async function whoami(opts) {
  const defaults = {
    cache: true,
    fast: false,
    network: rc.network.identity.resolver.network,
    keyring: (
      rc.network.identity.resolver.keyring
      || rc.network.identity.keyring
      || rc.network.keyring
    ),

    secret: (
      rc.network.identity.resolver.secret
      || rc.network.identity.secret
      || rc.network.secret
    )
  }

  const ropts = Object.assign(defaults, opts)

  const identifier = (
    ropts.identifier
    || rc.network.identity.whoami
    || rc.network.whoami
  )

  if (!identifier) {
    throw new Error('Could not determine identifier in `whoami`.')
  }

  if (true === ropts.fast) {
    if (isDomainName(identifier)) {
      return normalize(await resolveDNS(identifier))
    }

    return normalize(identifier)
  }

  let ddo = null

  try {
    ddo = await resolve(identifier, ropts)
  } catch (err) {
    throw new Error(`Unable to resolve identity: ${identifier}.`)
  }

  if (!ddo) {
    throw new Error('Missing or malformed identity document (ddo.json).')
  }

  return ddo.id
}

module.exports = {
  whoami
}
