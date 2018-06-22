const { resolve } = require('path')
const messages = require('./messages')
const fs = require('fs')

const kProtocolBufferSchema = fs.readFileSync(resolve(__dirname, 'index.proto'))

module.exports = {
  kProtocolBufferSchema,
  messages,
}
