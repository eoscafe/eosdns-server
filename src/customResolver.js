'use strict'

const assert = require('bsert')
const IP = require('binet')
const Logger = require('blgr')
const bns = require('bns')
const secp256k1 = require('bcrypto/lib/secp256k1')
const addEosDnsAttributes = require('./parseEosDns')
const { RES_OPT, CUSTOM_RESOLVER_DOMAIN } = require('../constants')

const { DNSServer, hsig, wire, util, StubResolver } = bns

const EosApi = require('./eos')
const {
  Message,
  typesByVal,
  codes,
  opcodes
} = wire

/**
 * RecursiveServer
 * @extends {DNSServer}
 */

class RecursiveServer extends DNSServer {
  constructor (options) {
    super(RES_OPT)

    this.ra = true
    this.edns = false
    this.dnssec = false
    this.noAny = true

    this.logger = Logger.global
    this.key = secp256k1.privateKeyGenerate()

    this.host = '127.0.0.1'
    this.port = 5301
    this.stubHost = '127.0.0.1'
    this.stubPort = 5300

    this.resolver = new StubResolver({
      tcp: true,
      inet6: false,
      edns: false,
      dnssec: false,
      hosts: [['localhost.', '127.0.0.1'], ['localhost.', '::1']],
      servers: ['1.1.1.1', '8.8.8.8', '8.8.4.4'] /* "127.0.0.1:5300", */
    })

    this.initNode()
    if (options) this.initOptions(options)
  }

  initOptions (options) {
    assert(options)

    this.parseOptions(options)

    if (options.nodeUrl !== null) {
      assert(typeof options.nodeUrl === 'string')
      this.eos = new EosApi(options.nodeUrl)
    }

    if (options.logger != null) {
      assert(typeof options.logger === 'object')
      this.logger = options.logger.context('rs')
    }

    if (options.key != null) {
      assert(Buffer.isBuffer(options.key))
      assert(options.key.length === 32)
      this.key = options.key
    }

    if (options.host != null) {
      assert(typeof options.host === 'string')
      this.host = IP.normalize(options.host)
    }

    if (options.host != null) {
      assert(typeof options.host === 'string')
      this.host = IP.normalize(options.host)
    }

    if (options.port != null) {
      assert((options.port & 0xffff) === options.port)
      assert(options.port !== 0)
      this.port = options.port
    }

    if (options.stubHost != null) {
      assert(typeof options.stubHost === 'string')

      this.stubHost = IP.normalize(options.stubHost)

      if (this.stubHost === '0.0.0.0' || this.stubHost === '::') { this.stubHost = '127.0.0.1' }
    }

    if (options.stubPort != null) {
      assert((options.stubPort & 0xffff) === options.stubPort)
      assert(options.stubPort !== 0)
      this.stubPort = options.stubPort
    }

    return this
  }

  initNode () {
    this.resolver.on('log', (...args) => {
      this.logger.info(...args)
    })

    this.on('error', err => {
      this.logger.error(err)
    })

    this.on('query', (req, res, rinfo) => {
      console.log('DNS Request:', req)
      console.log('DNS Response:', res)
      console.log('R Info:', rinfo)
    })

    return this
  }

  logMessage (prefix, msg) {
    if (this.logger.level < 5) return

    const logs = msg
      .toString()
      .trim()
      .split('\n')

    this.logger.spam(prefix)

    for (const log of logs) this.logger.spam(log)
  }

  signSize () {
    return 94
  }

  sign (msg, host, port) {
    return hsig.sign(msg, this.key)
  }

  async open (...args) {
    await super.open(this.port, this.host)

    this.logger.info('Recursive server listening on port %d.', this.port)
  }

  async close () {
    await super.close()
  }

  async resolve (req, rinfo) {
    const [qs] = req.question
    const type = typesByVal[qs.type]

    console.log(req)
    console.log(rinfo)
    
    const [, accountName] = qs.name
      .toLowerCase()
      .match(/(^[^/]+).eosdns.link.$/) || [null, null]

    if (accountName) {
      console.log('Resolved by EOS:', qs)

      let rows = await this.eos.getRecords(accountName)
      rows = rows.filter(row => row.type === type)
      const answer = rows.map(row => addEosDnsAttributes(row))
      const res = new Message()

      res.aa = true
      res.id = util.id()
      res.opcode = opcodes.QUERY
      res.code = codes.NOERROR
      res.qr = true
      res.rd = true
      res.ra = true
      res.ad = true
      res.question = [qs]
      res.answer = answer

      return res
    } else {
      console.log('Resolved by default:', qs)

      const resolved = await this.resolver.resolve(qs)
      return resolved
    }
  }
}

module.exports = RecursiveServer
