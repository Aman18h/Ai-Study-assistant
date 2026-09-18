function MessageBubble({ role, text }) {
  const isUser = role === "user";

  return (
    <div className={`msg-in flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "max-w-[70%] rounded-2xl rounded-br-md bg-[var(--accent)] px-4 py-2.5 text-[15px] leading-relaxed text-white"
            : "max-w-[75%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[15px] leading-relaxed text-[var(--ink)] shadow-sm ring-1 ring-black/[0.04]"
        }
      >
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

export default MessageBubble;