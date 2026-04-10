export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="pb-6">
        <div className="h-3 w-28 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
        <div className="mt-3 h-9 w-3/4 max-w-md animate-pulse rounded bg-[var(--color-bg-subtle)]" />
        <div className="mt-3 h-4 w-2/3 max-w-lg animate-pulse rounded bg-[var(--color-bg-subtle)]" />
        <hr className="mt-6 border-0 border-t border-[var(--color-border)]" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[0, 1, 2].map((k) => (
          <div
            key={k}
            className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]"
          >
            <div className="h-3 w-20 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
            <div className="mt-4 h-8 w-32 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
            <div className="mt-2 h-4 w-40 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
            <div className="mt-4 h-1.5 animate-pulse rounded-full bg-[var(--color-bg-subtle)]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div
          className="lg:col-span-3 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]"
        >
          <div className="h-6 w-40 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
          <div className="mt-6 space-y-4">
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className="h-12 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
            ))}
          </div>
        </div>
        <div
          className="lg:col-span-2 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]"
        >
          <div className="h-6 w-36 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
          <div className="mx-auto mt-8 h-44 w-44 animate-pulse rounded-full bg-[var(--color-bg-subtle)]" />
        </div>
      </div>

      <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
        <div className="h-3 w-32 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--color-bg-subtle)]" />
        <div className="mt-2 h-4 w-full max-w-xl animate-pulse rounded bg-[var(--color-bg-subtle)]" />
        <div className="mt-5 h-9 w-40 animate-pulse rounded-md bg-[var(--color-bg-subtle)]" />
      </div>
    </div>
  );
}
