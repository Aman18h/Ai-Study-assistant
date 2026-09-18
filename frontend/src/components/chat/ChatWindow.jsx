import { Send, FileText } from "lucide-react";
import MessageBubble from "./MessageBubble";
import Loader from "../common/Loader";

function ChatWindow({
  question,
  setQuestion,
  handleAskQuestion,
  loading,
  messages,
  chatEndRef,
  selectedDocument,
  selectedSession,
  documentTitle,
  onToggleSummary,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (question.trim() && !loading) handleAskQuestion();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-3.5">
        <h1 className="truncate text-sm font-medium text-[var(--ink)]">
          {documentTitle || "Select a document to start"}
        </h1>
        {selectedDocument && (
          <button
            onClick={onToggleSummary}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:bg-black/[0.04]"
          >
            <FileText size={14} />
            Summary
          </button>
        )}
      </div>

      <div className="scroll-thin scroll-thin-light flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {!selectedDocument && (
            <div className="mt-24 text-center text-sm text-[var(--ink-soft)]">
              Upload or select a PDF, then ask anything about it.
            </div>
          )}

          {selectedDocument && !selectedSession && (
            <div className="mt-24 text-center text-sm text-[var(--ink-soft)]">
              Start a new chat to ask about “{selectedDocument.title}”.
            </div>
          )}

          {selectedDocument && selectedSession && messages.length === 0 && !loading && (
            <div className="mt-24 text-center text-sm text-[var(--ink-soft)]">
              Ask your first question about “{selectedDocument.title}”.
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble key={index} role={message.role} text={message.text} />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-white px-4 py-2.5 shadow-sm ring-1 ring-black/[0.04]">
                <Loader />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="border-t border-[var(--line)] px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-[var(--line)] bg-white px-3 py-2 shadow-sm focus-within:border-[var(--accent)]">
          <textarea
            rows={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!selectedDocument || !selectedSession}
            placeholder={
              !selectedDocument
                ? "Select a document first…"
                : !selectedSession
                ? "Start a new chat first…"
                : "Ask a question about this document…"
            }
            className="max-h-40 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)] disabled:cursor-not-allowed"
          />
          <button
            onClick={handleAskQuestion}
            disabled={loading || !question.trim() || !selectedDocument || !selectedSession}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-colors hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-30"
            title="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;