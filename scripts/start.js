const kill = require('kill-port')
const RecursiveServer = require('../src/server')
const NODE_URL = process.env.NODE_URL
const enable = require('./enable');

(async () => {
  await kill(53)
  console.log(1);

  await enable()
  console.log(2);

  const recursiveServer = new RecursiveServer({
    port: 53,
    nodeUrl: NODE_URL
  })
  recursiveServer.open()
})()
