const { createIdentityKeyPath } = require('./key-path')
const { archive } = require('./archive')
const { resolve } = require('./resolve')
const { recover } = require('./recover')
const { create } = require('./create')
const { revoke } = require('./revoke')
const { update } = require('./update')
const { verify } = require('./verify')
const { save } = require('./save')
const { sign } = require('./sign')
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
  revoke,
  update,
  verify,
  save,
  sign,
  list,
  util,
  ddo,
  did,
  fs,
}
