
const { DNSServer, util, StubResolver } = require('bns');
const EosApi = require('./eos')
const assert = require('bsert')
const addEosDnsAttributes = require('./parseEosDns')
const Zone = require('./zone')

/**
 * AuthServer
 * @extends EventEmitter
 */

class AuthServer extends DNSServer {
  constructor(options) {
    super(options);
    this.zone = new Zone();
    this.file = null;
    this.ra = false;

    this.eos = new EosApi(options.nodeUrl)

    this.stubResolver = new StubResolver({
        tcp: true,
        inet6: false,
        edns: false,
        dnssec: false,
        hosts: [['localhost.', '127.0.0.1'], ['localhost.', '::1']],
        servers: ['1.1.1.1', '8.8.8.8', '8.8.4.4'] /* "127.0.0.1:5300", */
    })

    this.initOptions(options);
  }

  setOrigin(name) {
    this.zone.setOrigin(name);
    return this;
  }

  setFile(file) {
    this.zone.clearRecords();
    this.zone.fromFile(file);
    this.file = file;
    return this;
  }

  parseEosDomain (fqdn) {
    assert(util.isFQDN(fqdn))

    const TLD = `eos`
    const nameSplit = util.splitName(fqdn)

    // TLD is .eos
    if (nameSplit.length >= 2 && nameSplit[nameSplit.length - 1] === TLD) {
      // Return eoscafeblock from eoscafeblock.eos 
      return nameSplit[nameSplit.length - 2]
    } else {
      return undefined
    }
  }

  async resolve (req, rinfo) {
    const [qs] = req.question
    const { name, type } = qs;

    const zone = new Zone('.');
    const accountName = this.parseEosDomain(name)
    console.log('ACCOUNT', accountName)
    if (accountName) {
      const eosRecords = await this.eos.getRecords(accountName)
      console.log('RECORDS', eosRecords)

      for (const record of eosRecords) {
        zone.insert(addEosDnsAttributes(record))
      }
    } else {
        return this.stubResolver.resolve(qs)
    }

    console.log('ZONE', zone)
    console.log('RESOLVING QUESTION', qs)

    const resolved = zone.resolve(name, type);

    console.log('AUTH', resolved)
    return resolved
  }
}

/*
 * Expose
 */

module.exports = AuthServer;