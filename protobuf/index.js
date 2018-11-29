const messages = require('./messages')
const fs = require('fs')

// eslint-disable-next-line prefer-template,no-path-concat
const kProtocolBufferSchema = fs.readFileSync(__dirname + '/schema.proto')

module.exports = {
  kProtocolBufferSchema,
  messages,
}
