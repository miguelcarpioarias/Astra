import { create } from "zustand";

export const useAstraStore = create((set) => ({
  theme: "dark",
  messages: [],
  isThinking: false,
  model: "phi4:14b",

  setTheme: (theme) => set({ theme }),
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  setThinking: (isThinking) => set({ isThinking }),
  setModel: (model) => set({ model })
}));