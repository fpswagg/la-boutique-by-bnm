export function DashboardPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-[var(--surface-2)]" />
        <div className="h-10 w-64 max-w-full bg-[var(--surface-2)]" />
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-24 border border-[var(--border)] bg-[var(--surface)]" />
        ))}
      </div>
      <div className="h-[280px] border border-[var(--border)] bg-[var(--surface)]" />
      <div className="h-48 border border-[var(--border)] bg-[var(--surface)]" />
    </div>
  );
}
