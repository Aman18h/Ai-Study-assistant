import { useRef } from "react";
import { FileText, Plus, Trash2, LogOut } from "lucide-react";

function LeftSidebar({
  documents,
  selectedDocument,
  setSelectedDocument,
  deleteDocument,
  onFileChosen,
  uploading,
  onLogout,
}) {
  const fileInputRef = useRef(null);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileChosen(file);
    e.target.value = "";
  };

  return (
    <div className="flex h-full w-64 shrink-0 flex-col bg-[var(--panel)] text-zinc-300">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-semibold text-white">
          S
        </div>
        <span className="text-sm font-medium text-white">Study Assistant</span>
      </div>

      <div className="px-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={handlePickFile}
          disabled={uploading}
          className="flex w-full items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          <Plus size={16} />
          {uploading ? "Uploading…" : "Upload PDF"}
        </button>
      </div>

      <div className="mt-5 flex-1 overflow-y-auto px-3 scroll-thin">
        <p className="mb-1.5 px-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Documents
        </p>

        {documents.length === 0 && (
          <p className="px-1 py-2 text-xs text-zinc-500">
            No PDFs yet — upload one to get started.
          </p>
        )}

        <ul className="space-y-0.5">
          {documents.map((doc) => {
            const active = selectedDocument?.id === doc.id;
            return (
              <li key={doc.id}>
                <button
                  onClick={() => setSelectedDocument(doc)}
                  className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    active
                      ? "bg-[var(--accent-soft)] text-white"
                      : "text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  <FileText
                    size={15}
                    className={active ? "text-[var(--accent)]" : "text-zinc-500"}
                  />
                  <span className="flex-1 truncate">{doc.title}</span>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc.id);
                    }}
                    className="shrink-0 rounded p-1 text-zinc-500 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    title="Delete document"
                  >
                    <Trash2 size={13} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-white/10 px-3 py-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </div>
  );
}

export default LeftSidebar;