const fs = require("fs");
const path = require("path");
const { app, globalShortcut, ipcMain } = require("electron");
const {
  createMainWindow,
  loadMainWindowContent,
  resolveRendererEntry,
  toggleMainWindow,
} = require("../electron/window");
const {
  DEFAULT_TOGGLE_SHORTCUT,
  FALLBACK_TOGGLE_SHORTCUT,
  FALLBACK_TOGGLE_SHORTCUTS,
  resolveHotkeyConfig,
  registerGlobalHotkeys,
  unregisterGlobalHotkeys,
} = require("../electron/hotkeys");

const args = new Map(
  process.argv.slice(2).map((entry) => {
    const [key, value = ""] = entry.split("=");
    return [key.replace(/^--/, ""), value];
  }),
);

const mode = args.get("mode") || "build";
const reportDir = path.join(__dirname, "../data/diagnostics");
const reportPath = path.join(reportDir, `electron-behavior-${mode}.json`);
const profileRoot = path.join(reportDir, "runtime-profiles");

fs.mkdirSync(profileRoot, { recursive: true });
const isolatedProfilePath = fs.mkdtempSync(path.join(profileRoot, `${mode}-`));
const isolatedSessionPath = path.join(isolatedProfilePath, "session");
const isolatedCrashPath = path.join(isolatedProfilePath, "crashDumps");

fs.mkdirSync(isolatedSessionPath, { recursive: true });
fs.mkdirSync(isolatedCrashPath, { recursive: true });

app.setPath("userData", isolatedProfilePath);
app.setPath("sessionData", isolatedSessionPath);
app.setPath("crashDumps", isolatedCrashPath);

function waitForEvent(target, eventName, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for ${eventName}.`));
    }, timeoutMs);

    function handler(...eventArgs) {
      cleanup();
      resolve(eventArgs);
    }

    function cleanup() {
      clearTimeout(timer);
      if (typeof target.off === "function") {
        target.off(eventName, handler);
      } else if (typeof target.removeListener === "function") {
        target.removeListener(eventName, handler);
      }
    }

    if (typeof target.once === "function") {
      target.once(eventName, handler);
      return;
    }

    target.on(eventName, handler);
  });
}

function withTimeout(promise, timeoutMs, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timed out during ${label}.`)), timeoutMs);
    }),
  ]);
}

function writeReport(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
}

async function inspectRenderer(mainWindow) {
  return mainWindow.webContents.executeJavaScript(
    `(() => ({
      href: window.location.href,
      protocol: window.location.protocol,
      title: document.title,
      rootExists: Boolean(document.getElementById("root")),
      astraType: typeof window.astra,
      astraKeys: Object.keys(window.astra || {}).sort(),
      astraBridgeShape: {
        isAvailable: window.astra?.isAvailable === true,
        getAppInfo: typeof window.astra?.getAppInfo,
        llm: typeof window.astra?.llm,
        tool: typeof window.astra?.tool,
        ragQuery: typeof window.astra?.ragQuery,
        ragIngest: typeof window.astra?.ragIngest
      }
    }))()`,
    true,
  );
}

async function run() {
  const report = {
    mode,
    generatedAt: new Date().toISOString(),
    env: {
      VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL || "",
      ELECTRON_RUN_AS_NODE: process.env.ELECTRON_RUN_AS_NODE || "",
    },
    profile: {
      userData: isolatedProfilePath,
      sessionData: isolatedSessionPath,
      crashDumps: isolatedCrashPath,
    },
    intendedRendererEntry: "",
    configuredHotkey: null,
    renderer: null,
    toggle: null,
    hotkey: null,
    errors: [],
  };

  let mainWindow = null;
  let currentHotkeyStatus = {
    available: false,
    configuredShortcut: null,
    shortcut: null,
    source: "default",
    usedFallback: false,
  };

  try {
    await app.whenReady();

    report.intendedRendererEntry = resolveRendererEntry(app);
    const hotkeyConfig = resolveHotkeyConfig({ app });
    report.configuredHotkey = {
      shortcut: hotkeyConfig.shortcut,
      fallbackShortcuts: hotkeyConfig.fallbackShortcuts,
      source: hotkeyConfig.source,
      settingsPath: hotkeyConfig.settingsPath,
      errors: hotkeyConfig.errors,
    };

    ipcMain.removeHandler("astra:app-info");
    ipcMain.handle("astra:app-info", async () => ({
      hotkey: currentHotkeyStatus,
    }));

    mainWindow = createMainWindow(app, { showOnLaunch: false });

    const registration = registerGlobalHotkeys({
      fallbackShortcut: hotkeyConfig.fallbackShortcuts[0],
      fallbackShortcuts: hotkeyConfig.fallbackShortcuts,
      shortcut: hotkeyConfig.shortcut,
      toggleMainWindow: () => toggleMainWindow(mainWindow),
    });

    currentHotkeyStatus = {
      available: true,
      configuredShortcut: hotkeyConfig.shortcut,
      shortcut: registration.shortcut,
      source: hotkeyConfig.source,
      usedFallback: registration.usedFallback,
    };

    const failLoad = waitForEvent(mainWindow.webContents, "did-fail-load", 15000).then((args) => {
      const [, errorCode, errorDescription, validatedURL] = args;
      throw new Error(`Renderer failed to load (${errorCode}): ${errorDescription} @ ${validatedURL}`);
    });

    const finishLoad = waitForEvent(mainWindow.webContents, "did-finish-load", 15000);
    await withTimeout(loadMainWindowContent(app, mainWindow), 15000, "renderer load");
    await Promise.race([finishLoad, failLoad]);

    report.renderer = await inspectRenderer(mainWindow);

    const visibleBeforeToggle = mainWindow.isVisible();
    const firstToggleResult = toggleMainWindow(mainWindow);
    const visibleAfterFirstToggle = mainWindow.isVisible();
    const secondToggleResult = toggleMainWindow(mainWindow);
    const visibleAfterSecondToggle = mainWindow.isVisible();

    report.toggle = {
      visibleBeforeToggle,
      firstToggleResult,
      visibleAfterFirstToggle,
      secondToggleResult,
      visibleAfterSecondToggle,
    };

    report.hotkey = {
      requestedShortcut: registration.requestedShortcut,
      shortcut: registration.shortcut,
      usedFallback: registration.usedFallback,
      attemptedShortcuts: registration.attemptedShortcuts,
      defaultShortcut: DEFAULT_TOGGLE_SHORTCUT,
      fallbackShortcut: FALLBACK_TOGGLE_SHORTCUT,
      fallbackShortcuts: FALLBACK_TOGGLE_SHORTCUTS,
      isRegistered: globalShortcut.isRegistered(registration.shortcut),
    };

    unregisterGlobalHotkeys();
    report.hotkey.isRegisteredAfterCleanup = globalShortcut.isRegistered(registration.shortcut);
  } catch (error) {
    report.errors.push({
      message: error.message,
      stack: error.stack || "",
    });
  } finally {
    ipcMain.removeHandler("astra:app-info");

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.destroy();
    }

    unregisterGlobalHotkeys();
    writeReport(report);
    console.log(JSON.stringify(report, null, 2));
    app.quit();
  }
}

run().catch((error) => {
  const report = {
    mode,
    generatedAt: new Date().toISOString(),
    fatalError: {
      message: error.message,
      stack: error.stack || "",
    },
  };
  writeReport(report);
  console.log(JSON.stringify(report, null, 2));
  app.exit(1);
});
