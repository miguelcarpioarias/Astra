const { buildDiagnosticReport, writeDiagnosticReport } = require("./diagnostics");

const APP_DIAGNOSTIC_MODE = process.env.ASTRA_ELECTRON_APP_DIAGNOSTIC === "1";
const electronModule = require("electron");

function emitAppDiagnostic(notes) {
  const report = buildDiagnosticReport({
    mode: "app-entry",
    moduleRef: module,
    localRequire: require,
    entryFile: __filename,
    notes,
  });

  const reportPath = writeDiagnosticReport(report, "electron-app-resolution.json");
  console.log(JSON.stringify({ reportPath, report }, null, 2));
}

if (!electronModule || typeof electronModule !== "object") {
  emitAppDiagnostic(
    "The app entry loaded `require(\"electron\")` as a non-object value before window bootstrap.",
  );
  throw new Error(
    `Electron API bridge is unavailable in app mode. Received ${typeof electronModule} from require("electron").`,
  );
}

if (APP_DIAGNOSTIC_MODE) {
  emitAppDiagnostic("App-mode diagnostic requested before normal bootstrap.");
}

const { app, BrowserWindow, ipcMain } = electronModule;
const { createMainWindow, loadMainWindowContent, toggleMainWindow } = require("./window");
const { registerGlobalHotkeys, resolveHotkeyConfig, unregisterGlobalHotkeys } = require("./hotkeys");
const { handleLLMRequest } = require("./ollamaClient");
const { handleToolCall } = require("./tools/registry");
const { handleRAGQuery, handleRAGIngest } = require("./rag");

if (!app || !BrowserWindow || !ipcMain) {
  emitAppDiagnostic("Electron loaded as an object, but expected main-process APIs were missing.");
  throw new Error("Electron main-process APIs are missing from the resolved module.");
}

if (APP_DIAGNOSTIC_MODE) {
  process.exit(0);
}

let mainWindow = null;
let hotkeyStatus = {
  available: false,
  configuredShortcut: null,
  shortcut: null,
  source: "default",
  usedFallback: false,
};

function registerIpcHandlers() {
  ipcMain.removeHandler("astra:llm");
  ipcMain.removeHandler("astra:tool");
  ipcMain.removeHandler("astra:rag:query");
  ipcMain.removeHandler("astra:rag:ingest");
  ipcMain.removeHandler("astra:app-info");

  ipcMain.handle("astra:llm", handleLLMRequest);
  ipcMain.handle("astra:tool", handleToolCall);
  ipcMain.handle("astra:rag:query", handleRAGQuery);
  ipcMain.handle("astra:rag:ingest", handleRAGIngest);
  ipcMain.handle("astra:app-info", async () => ({
    hotkey: hotkeyStatus,
  }));
}

async function openMainWindow() {
  mainWindow = createMainWindow(app);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  registerWindowHotkey(mainWindow);
  await loadMainWindowContent(app, mainWindow);

  return mainWindow;
}

function registerWindowHotkey(targetWindow) {
  try {
    const hotkeyConfig = resolveHotkeyConfig({ app });

    hotkeyConfig.errors.forEach((message) => {
      console.warn(`Astra hotkey config warning: ${message}`);
    });

    const hotkeyRegistration = registerGlobalHotkeys({
      fallbackShortcut: hotkeyConfig.fallbackShortcuts[0],
      fallbackShortcuts: hotkeyConfig.fallbackShortcuts,
      shortcut: hotkeyConfig.shortcut,
      toggleMainWindow: () => toggleMainWindow(targetWindow),
    });

    hotkeyStatus = {
      available: true,
      configuredShortcut: hotkeyConfig.shortcut,
      shortcut: hotkeyRegistration.shortcut,
      source: hotkeyConfig.source,
      usedFallback: hotkeyRegistration.usedFallback,
    };

    if (hotkeyRegistration.usedFallback) {
      const sourceDescription =
        hotkeyConfig.source === "settings" && hotkeyConfig.settingsPath
          ? ` via ${hotkeyConfig.settingsPath}`
          : hotkeyConfig.source === "env"
            ? " via ASTRA_TOGGLE_SHORTCUT"
            : "";

      console.warn(
        `Astra hotkey fallback active: requested ${hotkeyRegistration.requestedShortcut}${sourceDescription}, using ${hotkeyRegistration.shortcut}.`,
      );
    }
  } catch (error) {
    hotkeyStatus = {
      available: false,
      configuredShortcut: null,
      shortcut: null,
      source: "default",
      usedFallback: false,
    };
    console.warn(`Astra hotkey registration skipped: ${error.message}`);
  }
}

app.whenReady().then(async () => {
  registerIpcHandlers();
  await openMainWindow();

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
