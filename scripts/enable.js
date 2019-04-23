const DnsEditor = require('edit-dns')
const dnsEditor = new DnsEditor('EOSDNS')

const NS = '127.0.0.1'

async function main () {
  console.log(1)
  // Saves current DNS settings
  await dnsEditor.save()
  console.log(2)

  // Load new DNS settings
  await dnsEditor.load([NS])
}

module.exports = main
