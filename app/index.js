"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var path_1 = require("path"); // FIXME: fix swc
var electron_1 = require("electron");
var query_core_1 = require("@tanstack/query-core");
var fs_1 = require("fs");
var axios = require('axios');
var appPath = (0, path_1.join)(electron_1.app.getPath('appData'), 'dev.blueish.burlap');
var keyPath = (0, path_1.join)(appPath, 'apikey.txt');
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
        trafficLightPosition: { x: 10, y: 10 },
        webPreferences: {
            spellcheck: true,
            preload: (0, path_1.join)(__dirname, 'preload.js')
        }
    });
    // Open the DevTools.
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        // mainWindow.removeMenu();
        mainWindow.loadFile((0, path_1.join)(__dirname, 'build', 'index.html'));
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
var getKey = function () {
    if ((0, fs_1.existsSync)(keyPath))
        return (0, fs_1.readFileSync)(keyPath, 'utf-8');
    else
        return undefined;
};
var queryClient = new query_core_1.QueryClient();
var avatar = undefined;
var apiKey = getKey();
electron_1.ipcMain.handle('get-key', getKey);
electron_1.ipcMain.handle('get-avatar', function () { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(avatar == undefined)) return [3 /*break*/, 2];
                return [4 /*yield*/, axios.get('https://apsva.instructure.com/api/v1/users/self/profile', {
                        headers: {
                            Authorization: "Bearer ".concat(apiKey)
                        }
                    })];
            case 1:
                data = _a.sent();
                avatar = data.data.avatar_url;
                _a.label = 2;
            case 2: return [2 /*return*/, avatar];
        }
    });
}); });
electron_1.ipcMain.handle('get-unread', function () { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, queryClient.fetchQuery(['unread_count'], function () { return __awaiter(void 0, void 0, void 0, function () {
                    var data;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, axios.get('https://apsva.instructure.com/api/v1/conversations/unread_count', {
                                    headers: {
                                        Authorization: "Bearer ".concat(apiKey)
                                    }
                                })];
                            case 1:
                                data = _a.sent();
                                return [2 /*return*/, data.data.unread_count];
                        }
                    });
                }); }, { staleTime: 15000 })];
            case 1:
                data = _a.sent();
                return [2 /*return*/, data];
        }
    });
}); });
electron_1.ipcMain.on('save-key', function (_event, key) {
    apiKey = key;
    if (!(0, fs_1.existsSync)(appPath))
        (0, fs_1.mkdirSync)(appPath);
    (0, fs_1.writeFileSync)(keyPath, key);
});
electron_1.ipcMain.handle('get-data', function (_event, url) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, queryClient.fetchQuery(url.split('/'), function () { return __awaiter(void 0, void 0, void 0, function () {
                    var data;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, axios.get("https://apsva.instructure.com/api/v1/".concat(url), {
                                    headers: {
                                        Authorization: "Bearer ".concat(apiKey)
                                    }
                                })];
                            case 1:
                                data = _a.sent();
                                return [2 /*return*/, data.data];
                        }
                    });
                }); }, { staleTime: 45000 })];
            case 1:
                data = _a.sent();
                return [2 /*return*/, data];
        }
    });
}); });
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
