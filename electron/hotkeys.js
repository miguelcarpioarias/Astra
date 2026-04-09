const { globalShortcut } = require("electron");

const DEFAULT_TOGGLE_SHORTCUT = "Alt+Space";

function registerGlobalHotkeys({ toggleMainWindow, shortcut = DEFAULT_TOGGLE_SHORTCUT }) {
  if (typeof toggleMainWindow !== "function") {
    throw new TypeError("toggleMainWindow must be a function");
  }

  const registered = globalShortcut.register(shortcut, toggleMainWindow);

  if (!registered) {
    throw new Error(`Failed to register global shortcut: ${shortcut}`);
  }

  return shortcut;
}

function unregisterGlobalHotkeys() {
  globalShortcut.unregisterAll();
}

module.exports = {
  DEFAULT_TOGGLE_SHORTCUT,
  registerGlobalHotkeys,
  unregisterGlobalHotkeys,
};
