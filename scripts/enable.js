const DnsEditor = require('edit-dns')
const dnsEditor = new DnsEditor('EOSDNS')

const NS = '127.0.0.1'

async function main () {
  // Saves current DNS settings
  console.log(11)
  console.log(dnsEditor)
  await dnsEditor.save()
  console.log(12)

  // Load new DNS settings
  await dnsEditor.load([NS])
}

module.exports = main
