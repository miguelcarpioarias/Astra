const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    frame: false,
    transparent: true,
    fullscreen: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const url =
    process.env.VITE_DEV_SERVER_URL ||
    `file://${path.join(__dirname, "../dist/index.html")}`;

  mainWindow.loadURL(url);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("Alt+Space", () => {
    toggleWindow();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC: tools + LLM + RAG
const { handleLLMRequest } = require("./ollamaClient");
const { handleToolCall } = require("./tools/registry");
const { handleRAGQuery, handleRAGIngest } = require("./rag");

ipcMain.handle("astra:llm", handleLLMRequest);
ipcMain.handle("astra:tool", handleToolCall);
ipcMain.handle("astra:rag:query", handleRAGQuery);
ipcMain.handle("astra:rag:ingest", handleRAGIngest);