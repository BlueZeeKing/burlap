import path = require('path')
import { app, BrowserWindow, ipcMain } from 'electron'
import { QueryClient } from '@tanstack/query-core'
import fs = require('fs')

const appPath = path.join(app.getPath('appData'), 'dev.blueish.burlap')
const keyPath = path.join(appPath, 'apikey.txt')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const isDev = process.env.IS_DEV === 'true'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    webPreferences: {
      spellcheck: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Open the DevTools.
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // mainWindow.removeMenu();
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

var queryClient = new QueryClient()

ipcMain.handle('get-key', () => {
  if (fs.existsSync(keyPath)) return fs.readFileSync(keyPath, 'utf-8')
  else return undefined
})

ipcMain.on('save-key', (event, key) => {
  console.log(key)
  if (!fs.existsSync(appPath)) fs.mkdirSync(appPath)

  fs.writeFileSync(keyPath, key)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
