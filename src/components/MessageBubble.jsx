import React from "react";
import { marked } from "marked";

export default function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } text-sm leading-relaxed`}
    >
      <div
        className={`max-w-3xl px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? "bg-astral-accent text-white"
            : "bg-white/5 dark:bg-white/5 text-gray-100"
        }`}
        dangerouslySetInnerHTML={{ __html: marked.parse(content || "") }}
      />
    </div>
  );
}