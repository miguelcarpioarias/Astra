const { app, BrowserWindow, ipcMain } = require("electron");
const { createMainWindow, loadMainWindowContent, toggleMainWindow } = require("./window");
const { registerGlobalHotkeys, unregisterGlobalHotkeys } = require("./hotkeys");
const { handleLLMRequest } = require("./ollamaClient");
const { handleToolCall } = require("./tools/registry");
const { handleRAGQuery, handleRAGIngest } = require("./rag");

let mainWindow = null;

function registerIpcHandlers() {
  ipcMain.removeHandler("astra:llm");
  ipcMain.removeHandler("astra:tool");
  ipcMain.removeHandler("astra:rag:query");
  ipcMain.removeHandler("astra:rag:ingest");

  ipcMain.handle("astra:llm", handleLLMRequest);
  ipcMain.handle("astra:tool", handleToolCall);
  ipcMain.handle("astra:rag:query", handleRAGQuery);
  ipcMain.handle("astra:rag:ingest", handleRAGIngest);
}

async function openMainWindow() {
  mainWindow = createMainWindow(app);
  await loadMainWindowContent(app, mainWindow);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}

app.whenReady().then(async () => {
  registerIpcHandlers();
  await openMainWindow();

  registerGlobalHotkeys({
    toggleMainWindow: () => toggleMainWindow(mainWindow),
  });

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await openMainWindow();
    } else if (mainWindow) {
      toggleMainWindow(mainWindow);
    }
  });
});

app.on("will-quit", () => {
  unregisterGlobalHotkeys();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
