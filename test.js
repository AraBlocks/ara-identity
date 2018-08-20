const context = require('ara-context')()
const { create } = require('./create')
const { archive } = require('./archive')
const util = require('./util')

test()

async function test(){
  try{
    const identity = await create({ context, password: 'password123' })
    const opts = {
      secret: 'archiver',
      keyring: '/Users/prashanthbalasubramani/.ara/secret/archiver_keys2.pub',
      name: 'remote1234'
    }
    await archive(identity, opts)
    return true
  } catch (err) {
    console.log(err)
  }
}
