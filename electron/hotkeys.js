const { globalShortcut } = require("electron");

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
  registerGlobalHotkeys,
  unregisterGlobalHotkeys,
};
