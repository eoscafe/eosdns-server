const kill = require('kill-port')
const RecursiveServer = require('../src/server')
const NODE_URL = process.env.NODE_URL
const DnsEditor = require('edit-dns')
const dnsEditor = new DnsEditor('EOSDNS')

const NS = '127.0.0.1'

async function main () {
  await kill(53)

  // Saves current DNS settings
  await dnsEditor.save()

  // Load new DNS settings
  await dnsEditor.load([NS])

  // Start server
  const recursiveServer = new RecursiveServer({
    port: 53,
    nodeUrl: NODE_URL
  })
  recursiveServer.open()
}

main()
