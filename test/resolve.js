const { resolve } = require('../resolve')
const test = require('ava')

const id = '0488542b72a639dc99e9de57cf9ef64911a1f146d29149f4e81690d963c99175'

test('resolve(uri)', async (t) => {
  t.plan(8)

  await t.throwsAsync(resolve(), TypeError, 'empty uri')
  await t.throwsAsync(resolve({}), TypeError, 'invalid argument (object)')
  await t.throwsAsync(resolve([]), TypeError, 'invalid argument (array)')
  await t.throwsAsync(resolve(true), TypeError, 'invalid argument (boolean)')
  await t.throwsAsync(resolve(1234), TypeError, 'invalid argument (number)')
  await t.throwsAsync(resolve(() => {}), TypeError, 'invalid argument (function)')
  await t.throwsAsync(resolve('did:foo:1234'), TypeError, 'invalid did method')
  await t.throwsAsync(resolve(`did:ara:${id.slice(0, 32)}`), TypeError, 'invalid did identifier')
})
