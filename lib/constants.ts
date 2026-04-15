/**
 * App-wide enums and display metadata for onboarding, checklist, budget, and vendors.
 * Domain TypeScript types derive IDs from these `as const` arrays in `types/index.ts`.
 */

export const GUEST_COUNT_RANGES = [
  { id: "under_50", label: "Under 50" },
  { id: "50_100", label: "50 – 100" },
  { id: "100_150", label: "100 – 150" },
  { id: "150_200", label: "150 – 200" },
  { id: "200_plus", label: "200+" },
] as const;

/** IDs must match `wedding_profiles.budget_range` CHECK in Supabase migrations. */
export const BUDGET_RANGES = [
  { id: "under_15k", label: "Under $15k", midpointCents: 750_000 },
  { id: "15k_30k", label: "$15k – $30k", midpointCents: 2_250_000 },
  { id: "30k_50k", label: "$30k – $50k", midpointCents: 4_000_000 },
  { id: "50k_75k", label: "$50k – $75k", midpointCents: 6_250_000 },
  { id: "75k_100k", label: "$75k – $100k", midpointCents: 8_750_000 },
  { id: "100k_plus", label: "$100k+", midpointCents: 12_000_000 },
] as const;

export const WEDDING_STYLES = [
  { id: "classic", label: "Classic / Traditional" },
  { id: "modern", label: "Modern / Minimal" },
  { id: "rustic", label: "Rustic / Barn" },
  { id: "romantic", label: "Romantic / Garden" },
  { id: "glam", label: "Glam / Black-tie" },
  { id: "bohemian", label: "Bohemian" },
  { id: "destination", label: "Destination" },
  { id: "cultural", label: "Cultural / Fusion" },
] as const;

export const PRIORITY_CATEGORIES = [
  { id: "venue", label: "Venue & date" },
  { id: "photography", label: "Photography & video" },
  { id: "catering", label: "Food & drink" },
  { id: "attire", label: "Attire & beauty" },
  { id: "music", label: "Music & entertainment" },
  { id: "flowers", label: "Florals & décor" },
  { id: "guests", label: "Guests & logistics" },
  { id: "budget", label: "Budget & contracts" },
] as const;

/** Phase ids match `checklist_items.phase` CHECK constraint in Supabase. */
export const CHECKLIST_PHASE_CONFIG = [
  { id: "12_plus_months", label: "12+ months out", sortOrder: 0 },
  { id: "9_12_months", label: "9 – 12 months out", sortOrder: 1 },
  { id: "6_9_months", label: "6 – 9 months out", sortOrder: 2 },
  { id: "3_6_months", label: "3 – 6 months out", sortOrder: 3 },
  { id: "1_3_months", label: "1 – 3 months out", sortOrder: 4 },
  { id: "final_month", label: "Final month", sortOrder: 5 },
  { id: "week_of", label: "Week of", sortOrder: 6 },
  { id: "day_of", label: "Day-of", sortOrder: 7 },
] as const;

/** @deprecated Prefer `CHECKLIST_PHASE_CONFIG`; kept for existing imports. */
export const CHECKLIST_PHASES = CHECKLIST_PHASE_CONFIG;

/** Category ids match `checklist_items.category` CHECK constraint in Supabase. */
export const CHECKLIST_CATEGORIES = [
  { id: "venue", label: "Venue" },
  { id: "vendors", label: "Vendors" },
  { id: "attire", label: "Attire" },
  { id: "legal", label: "Legal" },
  { id: "logistics", label: "Logistics" },
  { id: "guests", label: "Guests" },
  { id: "decor", label: "Décor" },
  { id: "food_beverage", label: "Food & beverage" },
  { id: "ceremony", label: "Ceremony" },
  { id: "travel", label: "Travel" },
  { id: "admin", label: "Admin" },
] as const;

export const TASK_EFFORT_LEVELS = [
  { id: "quick", label: "Quick" },
  { id: "medium", label: "Medium" },
  { id: "deep", label: "Deep focus" },
] as const;

export const BUDGET_CATEGORIES = [
  { id: "venue", label: "Venue", defaultPercent: 45 },
  { id: "catering", label: "Catering & bar", defaultPercent: 20 },
  { id: "photography", label: "Photography & video", defaultPercent: 12 },
  { id: "attire", label: "Attire & beauty", defaultPercent: 8 },
  { id: "music", label: "Music & entertainment", defaultPercent: 7 },
  { id: "flowers", label: "Florals & décor", defaultPercent: 8 },
] as const;

export const VENDOR_STATUSES = [
  { id: "researching", label: "Researching" },
  { id: "contacted", label: "Contacted" },
  { id: "quoted", label: "Quoted" },
  { id: "booked", label: "Booked" },
  { id: "paid", label: "Paid" },
] as const;

export type GuestCountRange = (typeof GUEST_COUNT_RANGES)[number]["id"];
export type BudgetRange = (typeof BUDGET_RANGES)[number]["id"];
export type StyleTag = (typeof WEDDING_STYLES)[number]["id"];
export type PriorityCategory = (typeof PRIORITY_CATEGORIES)[number]["id"];
export type ChecklistPhase = (typeof CHECKLIST_PHASE_CONFIG)[number]["id"];
export type ChecklistCategory = (typeof CHECKLIST_CATEGORIES)[number]["id"];

function daysUntilWeddingForPhase(weddingDate: string | null): number | null {
  if (!weddingDate) return null;
  const [y, m, d] = weddingDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Maps wedding date to the checklist phase the couple is in today. */
export function getCurrentPhase(weddingDate: string | null): ChecklistPhase | null {
  const days = daysUntilWeddingForPhase(weddingDate);
  if (days === null) return null;
  if (days > 365) return "12_plus_months";
  if (days > 270) return "9_12_months";
  if (days > 180) return "6_9_months";
  if (days > 90) return "3_6_months";
  if (days > 30) return "1_3_months";
  if (days > 7) return "final_month";
  if (days > 0) return "week_of";
  return "day_of";
}
export type TaskEffort = (typeof TASK_EFFORT_LEVELS)[number]["id"];
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number]["id"];
export type VendorStatus = (typeof VENDOR_STATUSES)[number]["id"];

export {
  DEFAULT_BUDGET_CATEGORIES,
  DEFAULT_CHECKLIST_ITEMS,
  getSuggestedDueDate,
} from "./onboarding-default-data";
export type { DefaultChecklistTemplate } from "./onboarding-default-data";
