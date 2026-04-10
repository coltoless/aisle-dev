import { BUDGET_RANGES, CHECKLIST_PHASES } from "@/lib/constants";
import type { ChecklistPhase } from "@/lib/constants";
import type { Database } from "@/types/supabase";

export type BudgetItemRow = Database["public"]["Tables"]["budget_items"]["Row"];

const PHASE_ORDER: ChecklistPhase[] = CHECKLIST_PHASES.map((p) => p.id);

export function daysUntilWedding(weddingDate: string | null): number | null {
  if (!weddingDate) return null;
  const [y, m, d] = weddingDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function formatLocationLine(profile: {
  location_city: string | null;
  location_state: string | null;
}): string {
  const city = profile.location_city?.trim();
  const state = profile.location_state?.trim();
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return "Location TBD";
}

export function formatDashboardHeadingDate(weddingDate: string | null): string | null {
  if (!weddingDate) return null;
  const [y, m, d] = weddingDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDaysAwayLabel(days: number | null): string | null {
  if (days === null) return null;
  if (days > 1) return `${days} days away`;
  if (days === 1) return "1 day away";
  if (days === 0) return "Today";
  return null;
}

export function buildDashboardSubline(
  weddingDate: string | null,
  profile: { location_city: string | null; location_state: string | null },
): string {
  const loc = formatLocationLine(profile);
  const dateFmt = formatDashboardHeadingDate(weddingDate);
  const days = daysUntilWedding(weddingDate);
  const away = formatDaysAwayLabel(days);

  if (dateFmt && away) {
    return `${dateFmt} · ${away} · ${loc}`;
  }
  return `${loc} · Date TBD`;
}

export function getCurrentChecklistPhase(weddingDate: string | null): ChecklistPhase | null {
  const days = daysUntilWedding(weddingDate);
  if (days === null) return null;
  if (days > 365) return "12_plus_months";
  if (days > 270) return "9_12_months";
  if (days > 180) return "6_9_months";
  if (days > 90) return "3_6_months";
  if (days > 30) return "1_3_months";
  if (days > 7) return "final_weeks";
  return "day_of";
}

export function checklistPhaseSortIndex(phase: string | null): number {
  if (!phase) return 999;
  const i = PHASE_ORDER.indexOf(phase as ChecklistPhase);
  return i === -1 ? 999 : i;
}

export function budgetTotalCentsFromProfile(
  budgetExact: number | null,
  budgetRange: string | null,
): number | null {
  if (budgetExact != null) return budgetExact;
  if (!budgetRange) return null;
  const range = BUDGET_RANGES.find((r) => r.id === budgetRange);
  return range?.midpointCents ?? null;
}

export function committedCentsForRow(row: BudgetItemRow): number {
  const q = row.quoted_cost ?? 0;
  const d = row.deposit_paid ?? 0;
  if (q > 0) return q;
  return d;
}

export function totalCommittedCents(items: BudgetItemRow[]): number {
  return items.reduce((s, r) => s + committedCentsForRow(r), 0);
}

export const BOOKED_VENDOR_STATUSES = ["booked", "paid"] as const;

export function isVendorBooked(status: string): boolean {
  return (BOOKED_VENDOR_STATUSES as readonly string[]).includes(status);
}

export function startOfTodayUtcDateString(): string {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
