"use strict";
exports.__esModule = true;
var path = require("path");
var electron_1 = require("electron");
var query_core_1 = require("@tanstack/query-core");
var fs = require("fs");
var appPath = path.join(electron_1.app.getPath('appData'), 'dev.blueish.burlap');
var keyPath = path.join(appPath, 'apikey.txt');
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    electron_1.app.quit();
}
var isDev = process.env.IS_DEV === 'true';
function createWindow() {
    // Create the browser window.
    var mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        titleBarStyle: 'hidden',
        webPreferences: {
            spellcheck: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    // Open the DevTools.
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        // mainWindow.removeMenu();
        mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
    }
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.whenReady().then(function () {
    createWindow();
    electron_1.app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
var queryClient = new query_core_1.QueryClient();
electron_1.ipcMain.handle('get-key', function () {
    if (fs.existsSync(keyPath))
        return fs.readFileSync(keyPath, 'utf-8');
    else
        return undefined;
});
electron_1.ipcMain.on('save-key', function (event, key) {
    console.log(key);
    if (!fs.existsSync(appPath))
        fs.mkdirSync(appPath);
    fs.writeFileSync(keyPath, key);
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
