const kill = require('kill-port')
require('./reset');

(async () => {
  try {
    await kill(53)
  } catch (e) {
    console.log(e)
  }
  process.exit(0)
})()
