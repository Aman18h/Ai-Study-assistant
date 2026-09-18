import { MessageSquare, Plus } from "lucide-react";

function ChatSidebar({
  sessions,
  selectedSession,
  loadChat,
  handleCreateChat,
  selectedDocument,
}) {
  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-l border-[var(--line)] bg-[var(--paper)]">
      <div className="px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
          Chats
        </p>
        {selectedDocument && (
          <p className="mt-0.5 truncate text-xs text-[var(--ink-soft)]/70">
            {selectedDocument.title}
          </p>
        )}
      </div>

      <div className="px-3">
        <button
          onClick={handleCreateChat}
          disabled={!selectedDocument}
          className="flex w-full items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)] transition-colors hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={16} />
          New chat
        </button>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto px-3 scroll-thin scroll-thin-light">
        {!selectedDocument && (
          <p className="px-1 py-2 text-xs text-[var(--ink-soft)]">
            Select a document to see its chats.
          </p>
        )}

        {selectedDocument && sessions.length === 0 && (
          <p className="px-1 py-2 text-xs text-[var(--ink-soft)]">
            No chats yet for this document.
          </p>
        )}

        <ul className="space-y-0.5">
          {sessions.map((session) => {
            const active = selectedSession?.id === session.id;
            return (
              <li key={session.id}>
                <button
                  onClick={() => loadChat(session)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                      : "text-[var(--ink)] hover:bg-black/[0.03]"
                  }`}
                >
                  <MessageSquare
                    size={15}
                    className={active ? "text-[var(--accent)]" : "text-[var(--ink-soft)]"}
                  />
                  <span className="truncate">
                    {session.title || "Untitled chat"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default ChatSidebar;