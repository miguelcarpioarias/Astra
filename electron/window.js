const path = require("path");
const fs = require("fs");
const { BrowserWindow } = require("electron");

function isDevelopment(app) {
  return Boolean(process.env.VITE_DEV_SERVER_URL) || !app.isPackaged;
}

function resolveRendererEntry(app) {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    return devServerUrl;
  }

  const builtIndex = path.join(__dirname, "../dist/index.html");
  if (app.isPackaged || fs.existsSync(builtIndex)) {
    return builtIndex;
  }

  return "http://localhost:5173";
}

async function loadMainWindowContent(app, mainWindow) {
  const entry = resolveRendererEntry(app);

  if (entry.startsWith("http://") || entry.startsWith("https://")) {
    await mainWindow.loadURL(entry);
    return;
  }

  await mainWindow.loadFile(entry);
}

function createMainWindow(app, options = {}) {
  const { showOnLaunch = isDevelopment(app) } = options;

  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 980,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#05060a",
    title: "Astra",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    if (showOnLaunch) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  return mainWindow;
}

function toggleMainWindow(mainWindow) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return false;
  }

  if (mainWindow.isVisible()) {
    mainWindow.hide();
    return false;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
  return true;
}

module.exports = {
  createMainWindow,
  loadMainWindowContent,
  resolveRendererEntry,
  toggleMainWindow,
};
