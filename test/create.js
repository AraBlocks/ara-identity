'use strict'

const { create } = require('../create')
const context = require('ara-context')()
const test = require('ava')

test("create(opts)", async (t) => {
  // TODO(jwerle): More tests
  t.true('object' == typeof await create({
    context, password: 'password',
    archive: { key: Buffer.from('hello') }
  }))
})
