'use strict'

const { resolve } = require('../resolve')
const test = require('ava')

const id = '0488542b72a639dc99e9de57cf9ef64911a1f146d29149f4e81690d963c99175'

test("resolve(uri)", async (t) => {
  t.throws(() => resolve(), TypeError, "empty uri")
  t.throws(() => resolve({}), TypeError, "invalid argument (object)")
  t.throws(() => resolve([]), TypeError, "invalid argument (array)")
  t.throws(() => resolve(true), TypeError, "invalid argument (boolean)")
  t.throws(() => resolve(1234), TypeError, "invalid argument (number)")
  t.throws(() => resolve(function () {}), TypeError, "invalid argument (function)")

  t.throws(() => resolve('did:foo:1234'), TypeError, "invalid did method")
  t.throws(() => resolve(`did:ara:${id.slice(0, 32)}`), TypeError, "invalid did identifier")
})
