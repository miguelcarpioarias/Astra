const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("astra", {
  llm: (payload) => ipcRenderer.invoke("astra:llm", payload),
  tool: (payload) => ipcRenderer.invoke("astra:tool", payload),
  ragQuery: (payload) => ipcRenderer.invoke("astra:rag:query", payload),
  ragIngest: (payload) => ipcRenderer.invoke("astra:rag:ingest", payload),
  getAppInfo: () => ipcRenderer.invoke("astra:app-info"),
  isAvailable: true
});
