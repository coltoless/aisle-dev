import { cn } from "@/lib/utils";

export type StatCardProps = {
  title: string;
  value: string;
  subtext: React.ReactNode;
  progress?: number;
  accentColor?: string;
  progressBarClassName?: string;
  footer?: React.ReactNode;
};

export function StatCard({
  title,
  value,
  subtext,
  progress,
  accentColor = "var(--color-accent)",
  progressBarClassName,
  footer,
}: StatCardProps) {
  const pct = progress === undefined ? null : Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn(
        "rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{title}</p>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">{value}</p>
      <div className="mt-1 text-sm">{subtext}</div>
      {footer ? <div className="mt-3">{footer}</div> : null}
      {pct !== null ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
          <div
            className={cn("h-full rounded-full transition-all duration-500", progressBarClassName)}
            style={{
              width: `${pct}%`,
              ...(progressBarClassName ? {} : { backgroundColor: accentColor }),
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
