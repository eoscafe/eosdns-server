const socks = require('socksv5')

const PORT = 8000

const srv = socks.createServer((info, accept, deny) => accept());

srv.listen(PORT, '0.0.0.0', () =>
  console.log(`SOCKS server listening on port ${PORT}`)
)

srv.useAuth(socks.auth.None())
