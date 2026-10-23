export function ProductsTableSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-[var(--surface-2)]" />
          <div className="h-10 w-48 bg-[var(--surface-2)]" />
        </div>
        <div className="h-9 w-32 bg-[var(--surface-2)]" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-7 w-16 bg-[var(--surface-2)]" />
        ))}
      </div>
      <div className="border border-[var(--border)] overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-14 border-b border-[var(--border)]/60 last:border-0 bg-[var(--surface)]"
          />
        ))}
      </div>
    </div>
  );
}
