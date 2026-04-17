import type { SupabaseClient } from "@supabase/supabase-js";
import { BUDGET_RANGES, CHECKLIST_CATEGORIES, CHECKLIST_PHASE_CONFIG } from "@/lib/constants";
import type { AppDatabase } from "@/types/database-app";
import type { WeddingProfile } from "@/types";
import type { WeddingContext } from "@/lib/ai/prompts";

const IMPORTANT_VENDOR_KEYS: { key: string; matchers: RegExp[] }[] = [
  { key: "photographer", matchers: [/photo/i, /imagery/i] },
  { key: "videographer", matchers: [/video/i, /film/i] },
  { key: "florist", matchers: [/flor/i, /flower/i] },
  { key: "dj", matchers: [/\bdj\b/i, /disc jockey/i, /entertainment/i, /band/i] },
  { key: "caterer", matchers: [/cater/i, /food/i, /chef/i] },
  { key: "officiant", matchers: [/officiant/i, /celebrant/i] },
  { key: "hair_makeup", matchers: [/hair/i, /makeup/i, /beauty/i] },
];

function isBookedCategory(bookedNorm: string[], matchers: RegExp[]): boolean {
  return bookedNorm.some((c) => matchers.some((m) => m.test(c)));
}

function todayISODate(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function fetchWeddingContextForBuddy(
  supabase: SupabaseClient<AppDatabase>,
  coupleId: string,
  partner1Name: string,
  partner2Name: string,
): Promise<WeddingContext | null> {
  const { data: profileRow, error: profileErr } = await supabase
    .from("wedding_profiles")
    .select("*")
    .eq("couple_id", coupleId)
    .maybeSingle();

  if (profileErr || !profileRow) return null;

  const profile: WeddingProfile = {
    id: profileRow.id,
    couple_id: profileRow.couple_id,
    wedding_date: profileRow.wedding_date,
    location_city: profileRow.location_city,
    location_state: profileRow.location_state,
    location_country: profileRow.location_country,
    guest_count_range: profileRow.guest_count_range as WeddingProfile["guest_count_range"],
    budget_range: profileRow.budget_range as WeddingProfile["budget_range"],
    budget_exact: profileRow.budget_exact,
    style_tags: profileRow.style_tags as WeddingProfile["style_tags"],
    priorities: profileRow.priorities as WeddingProfile["priorities"],
    style_notes: profileRow.style_notes ?? null,
    onboarding_complete: profileRow.onboarding_complete,
    created_at: profileRow.created_at,
    updated_at: profileRow.updated_at,
  };

  const today = todayISODate();

  const [{ data: checklistRows }, { data: budgetRows }, { data: vendorRows }] = await Promise.all([
    supabase.from("checklist_items").select("*").eq("couple_id", coupleId),
    supabase.from("budget_items").select("*").eq("couple_id", coupleId),
    supabase.from("vendors").select("category,status").eq("couple_id", coupleId),
  ]);

  const items = checklistRows ?? [];
  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const overdueCount = items.filter(
    (i) => !i.completed && i.due_date != null && i.due_date < today,
  ).length;

  const upcomingTasks = items
    .filter((i) => !i.completed)
    .sort((a, b) => {
      if (a.due_date == null && b.due_date == null) return 0;
      if (a.due_date == null) return 1;
      if (b.due_date == null) return -1;
      return a.due_date.localeCompare(b.due_date);
    })
    .slice(0, 5)
    .map((i) => ({ title: i.title, dueDate: i.due_date }));

  const budgetItems = budgetRows ?? [];
  const totalAllocatedCents = budgetItems.reduce((s, r) => s + (r.estimated_cost ?? 0), 0);
  const totalSpentCents = budgetItems.reduce((s, r) => s + (r.deposit_paid ?? 0), 0);
  const overBudgetCategories = budgetItems
    .filter(
      (r) =>
        r.quoted_cost != null &&
        r.estimated_cost != null &&
        r.quoted_cost > r.estimated_cost,
    )
    .map((r) => r.category_label || r.category);

  let totalBudgetCents = profile.budget_exact ?? 0;
  if (!totalBudgetCents && profile.budget_range) {
    const mid = BUDGET_RANGES.find((b) => b.id === profile.budget_range)?.midpointCents;
    totalBudgetCents = mid ?? 0;
  }

  const vendors = vendorRows ?? [];
  const booked = vendors
    .filter((v) => v.status === "booked")
    .map((v) => v.category.trim())
    .filter(Boolean);
  const bookedNorm = booked.map((c) => c.toLowerCase());

  const notYetBooked = IMPORTANT_VENDOR_KEYS.filter(
    ({ matchers }) => !isBookedCategory(bookedNorm, matchers),
  ).map(({ key }) => key);

  return {
    partner1Name,
    partner2Name,
    profile,
    checklistSummary: { total, completed, overdueCount, upcomingTasks },
    budgetSummary: {
      totalBudgetCents,
      totalAllocatedCents,
      totalSpentCents,
      overBudgetCategories,
    },
    vendorSummary: { booked, notYetBooked },
  };
}

export function normalizeChecklistCategory(raw: string): string {
  const id = raw.trim().toLowerCase().replace(/\s+/g, "_");
  const allowed = new Set(CHECKLIST_CATEGORIES.map((c) => c.id));
  if (allowed.has(id as (typeof CHECKLIST_CATEGORIES)[number]["id"])) return id;
  return "vendors";
}

export function normalizeChecklistPhase(raw: string): string {
  const id = raw.trim();
  const allowed = new Set(CHECKLIST_PHASE_CONFIG.map((c) => c.id));
  if (allowed.has(id as (typeof CHECKLIST_PHASE_CONFIG)[number]["id"])) return id;
  return "6_9_months";
}
