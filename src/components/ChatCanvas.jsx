import { useEffect, useRef } from "react";
import { useAstraStore } from "../lib/state";
import MessageBubble from "./MessageBubble";

export default function ChatCanvas() {
  const messages = useAstraStore((state) => state.messages);
  const isThinking = useAstraStore((state) => state.isThinking);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <section className="flex-1 space-y-4 overflow-y-auto px-8 py-6">
      {messages.map((message, index) => (
        <MessageBubble key={`${message.role}-${index}`} role={message.role} content={message.content} />
      ))}
      {isThinking ? (
        <div className="animate-pulse text-xs text-slate-400">Astra is thinking...</div>
      ) : null}
      <div ref={bottomRef} />
    </section>
  );
}
