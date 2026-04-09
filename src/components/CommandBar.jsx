import React, { useState } from "react";
import { useAstraStore } from "../lib/state";
import { askLLM } from "../lib/llmClient";

export default function CommandBar() {
  const [input, setInput] = useState("");
  const model = useAstraStore((s) => s.model);
  const addMessage = useAstraStore((s) => s.addMessage);
  const setThinking = useAstraStore((s) => s.setThinking);

  async function onSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    addMessage({ role: "user", content: trimmed });
    setInput("");
    setThinking(true);

    const reply = await askLLM({
      model,
      prompt: trimmed
    });

    addMessage({ role: "assistant", content: reply });
    setThinking(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full px-6 py-3 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-black/60 to-black/40"
    >
      <input
        className="flex-1 bg-white/5 dark:bg-white/5 bg-opacity-80 rounded-full px-4 py-2 outline-none text-sm placeholder:text-gray-400"
        placeholder="Ask Astra…  (supports natural language, slash commands, and RAG)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-full bg-astral-accent text-white text-xs font-medium hover:bg-astral-accentSoft transition"
      >
        Send
      </button>
    </form>
  );
}