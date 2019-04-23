const kill = require('kill-port')
const reset = require('./reset');

(async () => {
  await kill(53)
  await reset()
  process.exit(0)
})()
