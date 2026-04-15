"use client";

import Link from "next/link";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { formatUsdAbbreviated, formatUsdFromCents } from "@/lib/dashboard/format-money";
import type { BudgetItemRow } from "@/lib/dashboard/dashboard-data";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "hsl(152 28% 36%)",
  "hsl(24 10% 40%)",
  "hsl(40 30% 55%)",
  "hsl(152 20% 45%)",
  "hsl(24 50% 45%)",
  "hsl(152 28% 28%)",
  "hsl(24 10% 32%)",
];

type Slice = { name: string; value: number; color: string };

function buildSlices(items: BudgetItemRow[]): Slice[] {
  const positive = items
    .map((row) => ({
      name: row.category_label?.trim() || row.category,
      value: row.estimated_cost ?? 0,
    }))
    .filter((r) => r.value > 0);

  return positive.map((r, i) => ({
    ...r,
    color: CHART_COLORS[i % CHART_COLORS.length]!,
  }));
}

type BudgetSnapshotProps = {
  items: BudgetItemRow[];
};

export function BudgetSnapshot({ items }: BudgetSnapshotProps) {
  const slices = buildSlices(items);
  const hasData = slices.length > 0;

  const topFive = [...slices].sort((a, b) => b.value - a.value).slice(0, 5);

  if (!hasData) {
    return (
      <div
        className={cn(
          "rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]",
        )}
      >
        <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">Budget snapshot</h2>
        <p className="mt-6 text-sm leading-relaxed text-[var(--color-text-muted)]">
          Add your budget details to see your breakdown.
        </p>
        <Link
          href="/budget"
          className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          Go to budget →
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]",
      )}
    >
      <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">Budget snapshot</h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="mx-auto flex w-full max-w-[280px] justify-center">
          <PieChart width={280} height={220}>
            <Pie
              data={slices as { name: string; value: number; color: string }[]}
              dataKey="value"
              nameKey="name"
              cx={140}
              cy={110}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {slices.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatUsdFromCents(value)}
              labelFormatter={(name) => name}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                fontSize: 13,
              }}
            />
          </PieChart>
        </div>

        <div>
          <ul className="space-y-3">
            {topFive.map((row) => (
              <li key={row.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-[var(--color-text-primary)]">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                    aria-hidden
                  />
                  <span className="truncate">{row.name}</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums text-[var(--color-text-primary)]">
                  {formatUsdAbbreviated(row.value)}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/budget"
            className="mt-6 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            View full budget →
          </Link>
        </div>
      </div>
    </div>
  );
}
