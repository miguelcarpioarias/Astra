import React from "react";
import { useAstraStore } from "../lib/state";
import MessageBubble from "./MessageBubble";

export default function ChatCanvas() {
  const messages = useAstraStore((s) => s.messages);
  const isThinking = useAstraStore((s) => s.isThinking);

  return (
    <div className="flex-1 h-full overflow-y-auto px-8 py-6 space-y-4">
      {messages.map((m, i) => (
        <MessageBubble key={i} role={m.role} content={m.content} />
      ))}
      {isThinking && (
        <div className="text-xs text-gray-400 animate-pulse">
          Astra is thinking…
        </div>
      )}
    </div>
  );
}