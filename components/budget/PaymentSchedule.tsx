"use client";

import { DEFAULT_BUDGET_CATEGORIES } from "@/lib/constants";
import { formatUsdFromCents } from "@/lib/dashboard/format-money";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { BudgetItem } from "@/types/index";

type PaymentScheduleProps = {
  items: BudgetItem[];
};

function labelFor(item: BudgetItem): string {
  const fromDefaults = DEFAULT_BUDGET_CATEGORIES.find((c) => c.category === item.category)?.categoryLabel;
  return (fromDefaults || item.category_label || item.category).trim();
}

function balanceDueCents(item: BudgetItem): number {
  const q = item.quoted_cost ?? 0;
  const d = item.deposit_paid ?? 0;
  return q - d;
}

function parseIso(iso: string): Date | null {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDue(iso: string): string {
  const dt = parseIso(iso);
  if (!dt) return iso;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(iso: string): number | null {
  const dt = parseIso(iso);
  if (!dt) return null;
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return Math.floor((dt.getTime() - today.getTime()) / 86_400_000);
}

export function PaymentSchedule({ items }: PaymentScheduleProps) {
  const upcoming = items
    .map((i) => ({
      item: i,
      balance: balanceDueCents(i),
      due: i.balance_due_date,
    }))
    .filter((r) => r.balance > 0 && !!r.due)
    .sort((a, b) => a.due!.localeCompare(b.due!));

  return (
    <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
      <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
        Upcoming Payments
      </div>

      {upcoming.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">No upcoming payment deadlines.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {upcoming.map(({ item, balance, due }) => {
            const days = due ? daysUntil(due) : null;
            const overdue = days != null && days < 0;
            const dueSoon = days != null && days <= 14 && days >= 0;
            const comingUp = days != null && days <= 30 && days > 14;

            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {labelFor(item)}
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">{formatDue(due!)}</div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                    {formatUsdFromCents(balance)}
                  </div>
                  {overdue ? (
                    <Badge className="border-transparent bg-[var(--color-danger)] text-white">Overdue</Badge>
                  ) : dueSoon ? (
                    <Badge className="border-transparent bg-[var(--color-warning)] text-white">Due soon</Badge>
                  ) : comingUp ? (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "border-transparent bg-[color-mix(in oklab, var(--color-warning) 20%, transparent)] text-[var(--color-text-primary)]",
                      )}
                    >
                      Coming up
                    </Badge>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

