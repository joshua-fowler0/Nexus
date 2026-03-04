const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const Store = require("electron-store");

const store = new Store();
const isMac = process.platform === "darwin";

let mainWindow;

function createWindow() {
  const windowOptions = {
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#0a0e1a",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  };

  if (isMac) {
    windowOptions.titleBarStyle = "hiddenInset";
    windowOptions.trafficLightPosition = { x: 14, y: 16 };
  } else {
    windowOptions.frame = false;
    windowOptions.titleBarStyle = "hidden";
    windowOptions.titleBarOverlay = {
      color: "#0a0e1a",
      symbolColor: "#8b95a5",
      height: 36,
    };
  }

  mainWindow = new BrowserWindow(windowOptions);

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // In production, the build folder is bundled alongside main.js
    const indexPath = path.join(__dirname, "build", "index.html");

    // Log for debugging — check Console in DevTools if something goes wrong
    console.log("Production mode — loading:", indexPath);
    console.log("File exists:", fs.existsSync(indexPath));
    console.log("__dirname:", __dirname);

    mainWindow.loadFile(indexPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC handlers for persistent storage
ipcMain.handle("store-get", (event, key) => {
  return store.get(key);
});

ipcMain.handle("store-set", (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle("store-delete", (event, key) => {
  store.delete(key);
  return true;
});

// Expose platform to renderer
ipcMain.handle("get-platform", () => {
  return process.platform;
});
