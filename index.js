const { createIdentityKeyPath } = require('./key-path')
const { archive } = require('./archive')
const { resolve } = require('./resolve')
const { recover } = require('./recover')
const { create } = require('./create')
const ethereum = require('./ethereum')
const { list } = require('./list')
const util = require('./util')
const ddo = require('./ddo')
const did = require('./did')
const fs = require('./fs')

module.exports = {
  createIdentityKeyPath,
  ethereum,
  archive,
  recover,
  resolve,
  create,
  list,
  util,
  ddo,
  did,
  fs,
}
