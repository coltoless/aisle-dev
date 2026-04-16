"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { DEFAULT_BUDGET_CATEGORIES } from "@/lib/constants";
import { formatUsdFromCents } from "@/lib/dashboard/format-money";
import { cn } from "@/lib/utils";
import type { BudgetItem } from "@/types/index";

type BudgetDonutChartProps = {
  items: BudgetItem[];
  totalBudget: number; // cents
};

type Slice = {
  key: string;
  label: string;
  value: number; // cents
  color: string;
  muted?: boolean;
};

const FALLBACK_ROTATION = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function labelForItem(item: BudgetItem): string {
  const fromDefaults = DEFAULT_BUDGET_CATEGORIES.find((c) => c.category === item.category)?.categoryLabel;
  return (fromDefaults || item.category_label || item.category).trim();
}

function colorForCategory(category: string, label: string, index: number): string {
  switch (category) {
    case "venue":
      return "var(--color-chart-venue)";
    case "catering_bar":
      return "var(--color-chart-food)";
    case "photography":
      return "var(--color-chart-photo)";
    case "videography":
      return "var(--color-chart-music)";
    case "florals_decor":
      return "var(--color-chart-florals)";
    case "music_entertainment":
      return "var(--color-chart-music)";
    case "attire_partner1":
      return "var(--color-chart-attire)";
    case "attire_partner2":
      return "color-mix(in oklab, var(--color-chart-attire) 80%, white 20%)";
    case "miscellaneous_buffer":
      return "var(--color-chart-misc)";
    default:
      break;
  }

  void label;
  return FALLBACK_ROTATION[index % FALLBACK_ROTATION.length]!;
}

function pct(n: number): string {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n)}%`;
}

function CustomTooltip({
  active,
  payload,
  totalBudget,
}: {
  active?: boolean;
  payload?: Array<{ payload?: Slice }>;
  totalBudget: number;
}) {
  if (!active) return null;
  const p = payload?.[0]?.payload;
  if (!p) return null;
  const percent = totalBudget > 0 ? (p.value / totalBudget) * 100 : 0;
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 shadow-[var(--shadow-sm)]">
      <div className="text-xs font-medium text-[var(--color-text-muted)]">{p.label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
        {formatUsdFromCents(p.value)}{" "}
        <span className="ml-1 text-xs font-medium text-[var(--color-text-muted)]">{pct(percent)}</span>
      </div>
    </div>
  );
}

export function BudgetDonutChart({ items, totalBudget }: BudgetDonutChartProps) {
  /** Recharts clipPath ids differ SSR vs client; render after mount. */
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const slices = useMemo(() => {
    const withEst = items
      .map((it) => ({
        it,
        label: labelForItem(it),
        value: it.estimated_cost ?? 0,
      }))
      .filter((r) => r.value > 0);

    const base: Slice[] = withEst.map((r, i) => ({
      key: r.it.id,
      label: r.label,
      value: r.value,
      color: colorForCategory(r.it.category, r.label, i),
    }));

    const allocated = base.reduce((s, r) => s + r.value, 0);
    const unallocated = totalBudget - allocated;
    if (totalBudget > 0 && unallocated > 0) {
      base.push({
        key: "unallocated",
        label: "Unallocated",
        value: unallocated,
        color: "var(--color-chart-unallocated)",
        muted: true,
      });
    }

    return base;
  }, [items, totalBudget]);

  const anyNonZero = items.some((i) => (i.estimated_cost ?? 0) > 0);
  const committed = useMemo(() => {
    return items.reduce((s, r) => s + (r.quoted_cost != null && r.quoted_cost > 0 ? r.quoted_cost : (r.estimated_cost ?? 0)), 0);
  }, [items]);
  const centerPct = totalBudget > 0 ? Math.round((committed / totalBudget) * 100) : 0;

  const legend = useMemo(() => {
    const byValue = [...slices].filter((s) => !s.muted).sort((a, b) => b.value - a.value);
    const top3 = new Set(byValue.slice(0, 3).map((s) => s.key));
    return { top3 };
  }, [slices]);

  if (!anyNonZero) {
    return (
      <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Budget breakdown
        </h2>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Add your first budget estimate to see your breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
        Budget breakdown
      </h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        <div className="relative mx-auto flex h-[260px] w-[260px] items-center justify-center">
          {ready ? (
            <PieChart width={260} height={260}>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                cx={130}
                cy={130}
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {slices.map((s) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip totalBudget={totalBudget} />} />
            </PieChart>
          ) : (
            <div
              className="h-[240px] w-[240px] animate-pulse rounded-[999px] bg-[var(--color-bg-subtle)]"
              aria-hidden
            />
          )}

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="font-display text-4xl font-semibold text-[var(--color-text-primary)]">
              {pct(centerPct)}
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              allocated
            </div>
          </div>
        </div>

        <div className="max-h-[260px] overflow-auto pr-1">
          <ul className="space-y-2">
            {slices
              .filter((s) => !s.muted)
              .sort((a, b) => b.value - a.value)
              .map((s) => (
                <li key={s.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn("size-2 shrink-0 rounded-full")}
                      style={{ backgroundColor: s.color }}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "truncate text-[var(--color-text-primary)]",
                        legend.top3.has(s.key) && "font-semibold",
                      )}
                    >
                      {s.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 tabular-nums text-[var(--color-text-primary)]",
                      legend.top3.has(s.key) && "font-semibold",
                    )}
                  >
                    {formatUsdFromCents(s.value)}
                  </span>
                </li>
              ))}

            {slices.some((s) => s.key === "unallocated") ? (
              <li className="mt-3 border-t border-[var(--color-border)] pt-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-[var(--color-text-muted)]">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: "var(--color-chart-unallocated)" }}
                      aria-hidden
                    />
                    <span className="truncate">Unallocated</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--color-text-muted)]">
                    {formatUsdFromCents(slices.find((s) => s.key === "unallocated")!.value)}
                  </span>
                </div>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}

