const DnsEditor = require('edit-dns')
const dnsEditor = new DnsEditor('EOSDNS')

const NS = '127.0.0.1'

async function main () {
  // Saves current DNS settings
  await dnsEditor.save()

  // Load new DNS settings
  await dnsEditor.load([NS])
}

module.exports = main
