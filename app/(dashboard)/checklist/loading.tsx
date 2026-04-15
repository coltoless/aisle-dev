export default function ChecklistLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="h-10 w-64 rounded-md bg-[var(--color-bg-subtle)]" />
          <div className="h-4 w-40 rounded-md bg-[var(--color-bg-subtle)]" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-[var(--color-border)]">
          <div className="h-full w-1/3 rounded-full bg-[var(--color-bg-subtle)]" />
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <div className="h-8 w-16 rounded-full bg-[var(--color-bg-subtle)]" />
        <div className="h-8 w-24 rounded-full bg-[var(--color-bg-subtle)]" />
        <div className="h-8 w-20 rounded-full bg-[var(--color-bg-subtle)]" />
        <div className="h-8 w-24 rounded-full bg-[var(--color-bg-subtle)]" />
      </div>

      <div className="space-y-3">
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-40 rounded-md bg-[var(--color-bg-subtle)]" />
            <div className="h-4 w-16 rounded-md bg-[var(--color-bg-subtle)]" />
          </div>
        </div>
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 rounded-md bg-[var(--color-bg-subtle)]" />
            <div className="h-4 w-16 rounded-md bg-[var(--color-bg-subtle)]" />
          </div>
        </div>
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <div className="h-6 w-44 rounded-md bg-[var(--color-bg-subtle)]" />
            <div className="h-4 w-20 rounded-md bg-[var(--color-bg-subtle)]" />
          </div>
          <div className="space-y-0 px-5 py-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 border-b border-[var(--color-border)] py-3 last:border-b-0">
                <div className="size-4 rounded-[4px] bg-[var(--color-bg-subtle)]" />
                <div className="h-4 flex-1 rounded-md bg-[var(--color-bg-subtle)]" />
                <div className="h-4 w-16 rounded-md bg-[var(--color-bg-subtle)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
