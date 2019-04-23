const kill = require('kill-port')
const RecursiveServer = require('./src/server')
const NODE_URL = process.env.NODE_URL
require('./enable');

(async () => {
  console.log(1)
  try {
    await kill(53)
  } catch (e) {
    console.log(e)
  }

  const recursiveServer = new RecursiveServer({
    port: 53,
    nodeUrl: NODE_URL
  })
  recursiveServer.open()
})()
