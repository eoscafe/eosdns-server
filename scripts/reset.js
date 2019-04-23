const DnsEditor = require('edit-dns')
const dnsEditor = new DnsEditor('EOSDNS')

async function main () {
  // Recover saved settings
  await dnsEditor.recover()
}

module.exports = main
