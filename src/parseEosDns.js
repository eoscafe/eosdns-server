const { wire } = require('bns')

const {
  Record,
  ARecord,
  AAAARecord,
  NSRecord,
  CNAMERecord,
  SOARecord,
  PTRRecord,
  MXRecord,
  SRVRecord,
  NAPTRRecord,
  UNKNOWNRecord,
  TXTRecord,
  types
} = wire

/**
 * Currently supported:
 *  - A (1) & AAAA (28)
 *  - NS (2)
 *  - CNAME (5)
 *  - SOA (6)
 *  - PTR (12)
 *  - MX (15)
 *  - TXT (16)
 *  - SRV (33)
 *  - NAPTR (35)
 */
module.exports = function (record) {
  let rr = new Record()
  rr.name = record.name
  rr.type = types[record.type]
  rr.ttl = record.ttl

  let rd = new UNKNOWNRecord()
  switch (record.type) {
  case 'A':
    rd = new ARecord()
    rd.address = record.value
    break

  case 'AAAA':
    rd = new AAAARecord()
    rd.address = record.value
    break

  case 'NS':
    rd = new NSRecord()
    rd.ns = record.value
    break

    // CNAME
  case 'CNAME':
    rd = new CNAMERecord()
    rd.target = record.value
    break

    // SOA
  case 'SOA':
    rd = new SOARecord()

    const [
      primary,
      admin,
      serial,
      refresh,
      retry,
      expiration,
      minimum
    ] = record.value.split(' ')
    rd.ns = primary
    rd.mbox = admin
    rd.serial = serial
    rd.refresh = refresh
    rd.retry = retry
    rd.expire = expiration
    rd.minttl = minimum
    break

  case 'PTR':
    rd = new PTRRecord()
    rd.ptr = record.value
    break

  case 'MX':
    rd = new MXRecord()
    rd.preference = record.value.charAt(0)
    rd.mx = record.value.substring(2)
    break

  case 'TXT':
    rd = new TXTRecord()
    rd.txt = record.value
    break

  case 'SRV':
    rd = new SRVRecord()

    const [priority, weight, port, target] = record.value.split(' ')
    rd.priority = priority
    rd.weight = weight
    rd.port = port
    rd.target = target
    break

  case 'NAPTR':
    rd = new NAPTRRecord()

    const [
      order,
      preference,
      flags,
      service,
      regexp,
      replacement
    ] = record.value.split(' ')

    record.order = order
    record.preference = preference
    record.flags = flags
    record.service = service
    record.regexp = regexp
    record.replacement = replacement
    break
  }
  rr.data = rd
  console.log(rr)

  return rr
}
