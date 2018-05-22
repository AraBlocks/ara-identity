'use strict'

const { resolve } = require('./resolve')
const { create } = require('./create')
const ethereum = require('./ethereum')
const keyPair = require('./key-pair')
const util = require('./util')
const ddo = require('./ddo')
const did = require('./did')

module.exports = {
  ethereum,
  keyPair,
  resolve,
  create,
  util,
  ddo,
  did,
}
