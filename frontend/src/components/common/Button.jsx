function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
  title,
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed px-3.5 py-2";

  const variants = {
    primary:
      "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] shadow-sm",
    ghost:
      "bg-transparent text-zinc-300 hover:bg-white/10",
    ghostLight:
      "bg-transparent text-zinc-600 hover:bg-black/5",
    outline:
      "border border-[var(--line)] text-[var(--ink)] hover:bg-black/[0.03]",
    danger:
      "bg-transparent text-red-400 hover:bg-red-500/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;