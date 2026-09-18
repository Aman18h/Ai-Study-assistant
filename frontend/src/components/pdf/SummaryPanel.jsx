import { X } from "lucide-react";

function SummaryPanel({ text, open, onClose }) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex justify-end bg-black/20">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <h2 className="text-sm font-medium text-[var(--ink)]">
            Extracted summary
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--ink-soft)] hover:bg-black/[0.04]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="scroll-thin scroll-thin-light flex-1 overflow-y-auto px-5 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">
            {text || "No summary available yet."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SummaryPanel;