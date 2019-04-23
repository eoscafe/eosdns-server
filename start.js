const kill = require('kill-port')
const RecursiveServer = require('./src/server')
const NODE_URL = process.env.NODE_URL
require('./enable');

// const path = require('path')
// const { app, Menu, Tray } = require('electron')
// let tray = null
// app.on('ready', () => {
//   tray = new Tray(path.join(__dirname, '/eosdns.png'))
//   const contextMenu = Menu.buildFromTemplate([
//     { label: 'Item1', type: 'radio' },
//     { label: 'Item2', type: 'radio' },
//     { label: 'Item3', type: 'radio', checked: true },
//     { label: 'Item4', type: 'radio' }
//   ])
//   tray.setToolTip('This is my application.')
//   tray.setContextMenu(contextMenu)
// });

(async () => {
  console.log(1)
  try {
    await kill(53)
  } catch (e) {
    console.log(e)
  }

  const recursiveServer = new RecursiveServer({
    port: 53,
    nodeUrl: NODE_URL
  })
  recursiveServer.open()
})()
