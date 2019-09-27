import { app, BrowserWindow, Tray, Menu, ipcMain } from 'electron'
import path from 'path'
import { Register as APIRegister } from './backgroundApi/pass'

if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow = null
let tray = null

// 单实例锁
const singleLock = app.requestSingleInstanceLock()
if (!singleLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080'
  : `file://${path.join(__dirname, 'index.html')}`

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 500,
    resizable: false,
    alwaysOnTop: true,
    useContentSize: true,
    show: false,
    frame: false, // 隐藏窗口外壳
    webPreferences: {
      nodeIntegration: true // 允许在页面调用 node api
    }
  })
  mainWindow.loadURL(winURL)

  // 托盘图标
  tray = new Tray(process.env.NODE_ENV === 'development' ? 'public/icon256x256.ico' : path.join(__dirname, 'icon256x256.ico'))
  tray.setToolTip('密码管理器')
  const contextMenu = Menu.buildFromTemplate([
    { label: '退出', click: () => mainWindow.destroy() }
  ])
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    mainWindow.show()
    mainWindow.focus()
    // mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.send('isMaximized', mainWindow.isMaximized())
  })

  mainWindow.on('close', event => {
    mainWindow.hide()
    event.preventDefault()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    if (tray) {
      tray.destroy()
      tray = null
    }
  })

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('isMaximized', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('isMaximized', false)
  })
}

app.on('ready', createWindow)

app.on('window-all-closwd', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    app.releaseSingleInstanceLock()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcEventBind()
APIRegister(ipcMain)

function ipcEventBind () {
  ipcMain.on('debug', () => {
    mainWindow.webContents.toggleDevTools()
  })

  ipcMain.on('minimize', () => {
    if (mainWindow) {
      mainWindow.minimize()
    }
  })

  ipcMain.on('maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }
  })

  ipcMain.on('close', () => {
    if (mainWindow) {
      mainWindow.close()
    }
  })
}
