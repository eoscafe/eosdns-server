/*!
 * recursive.js - recursive dns server for bns
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/bns
 */

'use strict';

const { DNSServer, RecursiveResolver, StubResolver, util } = require('bns');
const assert = require('bsert')

/**
 * RecursiveServer
 * @extends EventEmitter
 */

class RecursiveServer extends DNSServer {
  constructor(options) {
    super(options);
    this.resolver = new RecursiveResolver(options);
    this.resolver.on('log', (...args) => this.emit('log', ...args));
    this.resolver.on('error', err => this.emit('error', err));
    this.ra = true;

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

  get cache() {
    return this.resolver.cache;
  }

  set cache(value) {
    this.resolver.cache = value;
  }

  get hints() {
    return this.resolver.hints;
  }

  set hints(value) {
    this.resolver.hints = value;
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
    console.log(qs)

    const accountName = this.parseEosDomain(name)
    if (accountName) {
      return this.resolver.resolve(qs)
    } else {
      return this.stubResolver.resolve(qs)
    }
  }
}

/*
 * Expose
 */

module.exports = RecursiveServer;