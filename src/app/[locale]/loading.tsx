export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg)] z-50">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[var(--fg)] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
