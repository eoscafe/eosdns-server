const { JsonRpc } = require('eosjs')
const { DNS_CONTRACT, DNS_TABLE } = require('./constants')
const fetch = require('node-fetch')

class EosApi {
  constructor (nodeUrl) {
    this.rpc = new JsonRpc(nodeUrl, { fetch })
  }

  async getRecords (accountName) {
    const { rows } = await this.rpc.get_table_rows({
      code: DNS_CONTRACT,
      scope: accountName,
      table: DNS_TABLE
    })
  
    return rows
  }
}

module.exports = EosApi
