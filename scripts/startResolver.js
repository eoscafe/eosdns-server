const kill = require('kill-port')
const RecursiveServer = require('../src/customResolver')
const NODE_URL = process.env.NODE_URL
const enable = require('./enable');

(async () => {
  await kill(53)
  await enable()

  const recursiveServer = new RecursiveServer({
    port: 53,
    nodeUrl: NODE_URL
  })
  recursiveServer.open()
})()
