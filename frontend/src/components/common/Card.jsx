function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-[var(--line)] bg-white/70 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;