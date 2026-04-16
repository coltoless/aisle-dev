import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--color-bg-subtle)]", className)}
      aria-hidden
    />
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <SkeletonBlock className="h-10 w-56 rounded-lg" />
        <SkeletonBlock className="h-10 w-32 rounded-lg" />
      </div>

      <div className="grid w-full grid-cols-3 items-center rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-sm)]">
        <div className="space-y-2 px-2">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-7 w-32" />
        </div>
        <div className="space-y-2 border-x border-[var(--color-border)] px-4">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-7 w-32" />
        </div>
        <div className="space-y-2 px-2">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-7 w-32" />
        </div>
      </div>

      <div className="h-px w-full bg-[var(--color-border)]" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
          <SkeletonBlock className="h-5 w-40" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
            <SkeletonBlock className="mx-auto h-[240px] w-[240px] rounded-full" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <SkeletonBlock className="h-4 w-40" />
                  <SkeletonBlock className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
          <SkeletonBlock className="h-4 w-44" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
        <SkeletonBlock className="h-5 w-40" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
