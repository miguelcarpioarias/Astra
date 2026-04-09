const { globalShortcut } = require("electron");
const {
  TOGGLE_FALLBACK_SHORTCUTS_ENV_VAR,
  TOGGLE_SHORTCUT_ENV_VAR,
  loadSettings,
  normalizeShortcut,
  parseShortcutList,
} = require("./settings");

const DEFAULT_TOGGLE_SHORTCUT = "Alt+Space";
const FALLBACK_TOGGLE_SHORTCUT = "CommandOrControl+Shift+Space";
const FALLBACK_TOGGLE_SHORTCUTS = [
  FALLBACK_TOGGLE_SHORTCUT,
  "CommandOrControl+Alt+A",
  "CommandOrControl+Shift+A",
];

function tryRegisterShortcut(shortcut, toggleMainWindow) {
  if (!shortcut) {
    return false;
  }

  return globalShortcut.register(shortcut, toggleMainWindow);
}

function resolveHotkeyConfig({ app, env = process.env } = {}) {
  const settingsResult = loadSettings({ app, env });
  const settings = settingsResult.settings || {};
  const configuredShortcut = normalizeShortcut(settings?.hotkeys?.toggle);
  const configuredFallbacks = parseShortcutList(settings?.hotkeys?.fallbacks);
  const envShortcut = normalizeShortcut(env[TOGGLE_SHORTCUT_ENV_VAR]);
  const envFallbacks = parseShortcutList(env[TOGGLE_FALLBACK_SHORTCUTS_ENV_VAR]);

  const shortcut = envShortcut || configuredShortcut || DEFAULT_TOGGLE_SHORTCUT;
  const source = envShortcut ? "env" : configuredShortcut ? "settings" : "default";
  const preferredFallbacks = envFallbacks.length > 0 ? envFallbacks : configuredFallbacks;
  const fallbackShortcuts = [
    ...preferredFallbacks,
    ...FALLBACK_TOGGLE_SHORTCUTS,
  ].filter((candidate) => candidate && candidate !== shortcut);

  return {
    errors: settingsResult.errors,
    fallbackShortcuts: [...new Set(fallbackShortcuts)],
    settingsPath: settingsResult.path,
    shortcut,
    source,
  };
}

function registerGlobalHotkeys({
  toggleMainWindow,
  shortcut = DEFAULT_TOGGLE_SHORTCUT,
  fallbackShortcut = FALLBACK_TOGGLE_SHORTCUT,
  fallbackShortcuts = FALLBACK_TOGGLE_SHORTCUTS,
}) {
  if (typeof toggleMainWindow !== "function") {
    throw new TypeError("toggleMainWindow must be a function");
  }

  const shortcuts = [
    shortcut,
    fallbackShortcut,
    ...(Array.isArray(fallbackShortcuts) ? fallbackShortcuts : [fallbackShortcuts]),
  ].filter(Boolean);

  const uniqueShortcuts = [...new Set(shortcuts)];

  for (const candidate of uniqueShortcuts) {
    if (tryRegisterShortcut(candidate, toggleMainWindow)) {
      return {
        requestedShortcut: shortcut,
        shortcut: candidate,
        usedFallback: candidate !== shortcut,
        attemptedShortcuts: uniqueShortcuts,
      };
    }
  }

  throw new Error(`Failed to register global shortcut: ${uniqueShortcuts.join(", ")}`);
}

function unregisterGlobalHotkeys() {
  globalShortcut.unregisterAll();
}

module.exports = {
  DEFAULT_TOGGLE_SHORTCUT,
  FALLBACK_TOGGLE_SHORTCUT,
  FALLBACK_TOGGLE_SHORTCUTS,
  resolveHotkeyConfig,
  registerGlobalHotkeys,
  unregisterGlobalHotkeys,
};
