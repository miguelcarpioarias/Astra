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
      ollama: {
        available: false,
        defaultModel: "phi4:14b",
        error: "",
        models: [],
        url: "http://localhost:11434",
      },
    };
  }

  return window.astra.getAppInfo();
}
