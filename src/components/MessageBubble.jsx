export default function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} text-sm leading-relaxed`}>
      <div
        className={`max-w-3xl whitespace-pre-wrap break-words rounded-2xl px-4 py-3 shadow-sm ${
          isUser ? "bg-astral-accent text-white" : "bg-white/5 text-gray-100"
        }`}
      >
        {content || ""}
      </div>
    </div>
  );
}
