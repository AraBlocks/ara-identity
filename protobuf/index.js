const { resolve } = require('path')
const messages = require('./messages')
const fs = require('fs')

const kProtocolBufferSchema = fs.readFileSync(resolve(
  __dirname,
  'schema.proto'
))

module.exports = {
  kProtocolBufferSchema,
  messages,
}
