const kill = require('kill-port')
const DnsEditor = require('edit-dns')
const dnsEditor = new DnsEditor('EOSDNS')

async function main () {
  await kill(53)

  // Recover saved settings
  await dnsEditor.recover()

  process.exit(0)
}

main()
