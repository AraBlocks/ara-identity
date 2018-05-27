'use strict'

const { create } = require('../create')
const context = require('ara-context')()
const path = require('path')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

test("create(opts)", async (t) => {
  // TODO(jwerle): More tests
  // @TODO(jwerle): Remove this
  const { keystore } = JSON.parse(await pify(fs.readFile)(
    path.resolve(__dirname, '../keystore.pub')
  ))

  const key = Buffer.alloc(16).fill('test')
  t.true('object' == typeof await create({
    context, password: 'password',
    archive: { key, keystore }
  }))
})
