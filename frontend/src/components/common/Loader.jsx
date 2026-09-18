function Loader({ label = "Thinking" }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
      <span>{label}</span>
      <span className="flex items-end gap-0.5">
        <span className="dot h-1.5 w-1.5 rounded-full bg-current" />
        <span className="dot h-1.5 w-1.5 rounded-full bg-current" />
        <span className="dot h-1.5 w-1.5 rounded-full bg-current" />
      </span>
    </div>
  );
}

export default Loader;