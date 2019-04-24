const DnsEditor = require('edit-dns')
const dnsEditor = new DnsEditor('EOSDNS')

async function main () {
  // Recover saved settings
  await dnsEditor.recover()

  // Delete saved file
  await dnsEditor.deleteDataFile()

  process.exit(0)
}

main()