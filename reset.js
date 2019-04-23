const util = require('util')
const exec = util.promisify(require('child_process').exec)
const { getResolverCommand } = require('./utils')
const NS = '1.1.1.1'

async function main () {
  const command = getResolverCommand(NS)
  const { stdout, stderr } = await exec(command)

  if (stdout) {
    console.log(stdout)
  }
  
  if (stderr) {
    console.error(`error: ${stderr}`)
  }
}

main()
