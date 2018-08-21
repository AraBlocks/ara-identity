const context = require('ara-context')()
const { create } = require('./create')
const { archive } = require('./archive')
const { resolve } = require('./resolve')
const util = require('./util')

test()

async function test(){
  try{
    // const identity = await create({ context, password: 'password123' })
    const opts = {
      secret: 'ara-resolver',
      keyring: '/Users/prashanthbalasubramani/Desktop/Github/ARA/1-owned-ara-projects/ara-resolver.pub',
      name: 'resolve1',
      cache: false
    }
    //await archive(identity, opts)
    const ddo = await resolve('1e13562a829e96136c380a492ef25277d26a7acf327b0bc0445922ce0cab3205', opts)
    console.log(ddo)
    return true
  } catch (err) {
    console.log(err)
  }
}
