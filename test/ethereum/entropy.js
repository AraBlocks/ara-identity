'use strict'

const ethereum = require('../../ethereum')
const test = require('ava')

test("ethereum.entropy(size)", async (t) => {
  t.plan(6)
  await t.throws(ethereum.entropy(0), TypeError, "too small")
  await t.throws(ethereum.entropy(1), TypeError, "too small")
  await t.throws(ethereum.entropy(-1), TypeError, "too small")
  await t.throws(ethereum.entropy(15), TypeError, "too small")
  void t.true(32 == (await ethereum.entropy(16)).length) // minimum
  void t.true(64 == (await ethereum.entropy()).length) // default
})
