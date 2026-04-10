import { create } from "zustand";

export const useAstraStore = create((set) => ({
  theme: "dark",
  messages: [
    {
      role: "assistant",
      content: "Astra is ready. Ask a question, or drop a file to index it for retrieval.",
    },
  ],
  isThinking: false,
  model: "phi4:14b",
  lastError: "",
  appInfo: {
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
  },

  setTheme: (theme) => set({ theme }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setThinking: (isThinking) => set({ isThinking }),
  setModel: (model) => set({ model }),
  setLastError: (lastError) => set({ lastError }),
  setAppInfo: (appInfo) => set({ appInfo }),
  clearMessages: () =>
    set({
      messages: [
        {
          role: "assistant",
          content: "Chat cleared. I'm ready for the next task.",
        },
      ],
    }),
}));
