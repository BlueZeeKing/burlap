import { join } from 'path' // FIXME: fix swc
import { app, BrowserWindow, ipcMain } from 'electron'
import { QueryClient } from '@tanstack/query-core'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
const axios = require('axios')

const appPath = join(app.getPath('appData'), 'dev.blueish.burlap')
const keyPath = join(appPath, 'apikey.txt')

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
    trafficLightPosition: { x: 10, y: 10 },
    webPreferences: {
      spellcheck: true,
      preload: join(__dirname, 'preload.js'),
    },
  })

  // Open the DevTools.
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // mainWindow.removeMenu();
    mainWindow.loadFile(join(__dirname, 'build', 'index.html'))
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

const getKey = () => {
  if (existsSync(keyPath)) return readFileSync(keyPath, 'utf-8')
  else return undefined
}

var queryClient = new QueryClient()
var avatar = undefined
var apiKey = getKey()

ipcMain.handle('get-key', getKey)

ipcMain.handle('get-avatar', async () => {
  if (avatar == undefined) {
    const data = await axios.get('https://apsva.instructure.com/api/v1/users/self/profile', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    avatar = data.data.avatar_url
  }

  return avatar
})

ipcMain.handle('get-unread', async () => {
  const data = await queryClient.fetchQuery(
    ['unread_count'],
    async () => {
      const data = await axios.get(
        'https://apsva.instructure.com/api/v1/conversations/unread_count',
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      )
      return data.data.unread_count
    },
    { staleTime: 15000 }
  )

  return data
})

ipcMain.on('save-key', (_event, key) => {
  apiKey = key
  if (!existsSync(appPath)) mkdirSync(appPath)

  writeFileSync(keyPath, key)
})

ipcMain.handle('get-data', async (_event, url: string) => {
  const data = await queryClient.fetchQuery(
    [url.split('/')],
    async () => {
      const data = await axios.get(`https://apsva.instructure.com/api/v1/${url}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
      return data.data
    },
    { staleTime: 45000 }
  )

  return data
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
