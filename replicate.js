/**
 * Replicate ara identity files from remote server
 * @param  {[type]} opts [description]
 * @return {[type]}      [description]
 */

async function replicate(opts) {
  if (null == argv.key) {
    onfatal(new Error("Expecting network key."))
  }

  if (null == argv.did) {
    onfatal(new Expecting("Expecting DID URI to replicate."))
  }

  try {
    const doc = await secrets.load(argv)
    let publicKey = null
    let secretKey = null
    let keystore = null

    if (doc.public) { keystore = doc.public.keystore }
    else if (doc.secret) { keystore = doc.secret.keystore }

    if (password) {
      const keyPair = crypto.keyPair(password)
      publicKey = keyPair.publicKey
      secret = keyPair.secretKey
    } else {
      publicKey = identifier
    }

    const cfs = await createCFS({
      storage: ram,
      shallow: true,
      key: publicKey,
      id: toHex(publicKey),
    })

    const { identifier } = did.parse(argv.did)
    const hash = toHex(crypto.blake2b(Buffer.from(identifier, 'hex')))
    const output = resolve(rc.network.identity.root, hash)

    const discovery = createSwarm({
      dns: { loopback: true, multicast: true },
      stream() {
        const stream = cfs.replicate({live: false})
        stream.once('end', onend)
        return stream
      }
    })

    discovery.join(cfs.discoveryKey)
    cfs.once('update', onsync)

    async function onsync() {
      const files = await cfs.readdir('.')
      const state = {skips: 0, puts: 0}
      const partition = cfs.partitions.resolve('/home')
      mirror({name: '/', fs: partition}, {name: output, fs})
        .on('skip', () => { state.skips++ })
        .on('put', () => { state.puts++ })
        .on('end', onend)
    }

    function onend() {
      cfs.close()
      discovery.destroy()
    }

  } catch (err) {
    onfatal(err)
  }
}

module.exports = {
  replicate
}
