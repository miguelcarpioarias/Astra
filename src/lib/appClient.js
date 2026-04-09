export async function getAppInfo() {
  if (!window.astra?.getAppInfo) {
    return {
      hotkey: {
        available: false,
        configuredShortcut: null,
        shortcut: null,
        source: "default",
        usedFallback: false,
      },
    };
  }

  return window.astra.getAppInfo();
}
