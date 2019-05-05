const kill = require('kill-port')
const NODE_URL = process.env.NODE_URL
const DnsEditor = require('edit-dns')
const AuthServer = require('../src/auth')
const RecursiveServer = require('../src/recursive')
const { wire: { Record, KSK_2010 } } = require('bns');

const exitHook = require('../src/asyncExit');
const dnsEditor = new DnsEditor('EOSDNS')

const NS = '127.0.0.1'

// async function exit (err, callback) {
//   console.log(err)
//   try {
//     await dnsEditor.recover()
//   } catch (e) {
//     console.log(e)
//   }
//   callback()
// }
// exitHook.uncaughtExceptionHandler((err, callback) => {
//   exit(err, callback)
// });
// exitHook.unhandledRejectionHandler((err, callback) => {
//   exit(err, callback)
// });
// exitHook(callback => {
//   exit('ExitHookErr', callback)
// })

async function auth () {
  authServer = new AuthServer({
    tcp: true,
    edns: true,
    dnssec: false,
    nodeUrl: NODE_URL
  });

  authServer.on('error', (err) => {
    console.log(err)
    throw err;
  });

  authServer.on('query', (q) => {
    // console.log(q)
  });

  authServer.setOrigin('.');
  console.log(authServer)

  await authServer.bind(5301, '127.0.0.1');
}

async function recursive () {
  recServer = new RecursiveServer({
    tcp: true,
    inet6: true,
    edns: true,
    dnssec: true
  });

  recServer.on('error', (err) => {
    console.log('RE', err)
    throw err;
  });

  recServer.on('query', (q) => {
    // console.log(q)
  });

  recServer.resolver.setStub(
    '127.0.0.1',
    5301,
    Record.fromString(KSK_2010)
  );

  await recServer.bind(53, '127.0.0.1');
}

async function main () {
  await kill(53)

  // Saves current DNS settings
  await dnsEditor.save()

  // Load new DNS settings
  await dnsEditor.load([NS])

  // Start server
  await auth()
  await recursive()
}

main()
