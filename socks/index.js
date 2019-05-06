const socks = require('socksv5')

const PORT = process.env.SOCKS_PORT

const srv = socks.createServer((info, accept, deny) => accept());

srv.listen(PORT, '0.0.0.0', () =>
  console.log(`SOCKS server listening on port ${PORT}`)
)

srv.useAuth(socks.auth.None())
