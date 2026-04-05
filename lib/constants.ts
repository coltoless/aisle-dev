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

export const BUDGET_RANGES = [
  { id: "under_15k", label: "Under $15k", midpointCents: 750_000 },
  { id: "15k_25k", label: "$15k – $25k", midpointCents: 2_000_000 },
  { id: "25k_40k", label: "$25k – $40k", midpointCents: 3_250_000 },
  { id: "40k_60k", label: "$40k – $60k", midpointCents: 5_000_000 },
  { id: "60k_80k", label: "$60k – $80k", midpointCents: 7_000_000 },
  { id: "80k_plus", label: "$80k+", midpointCents: 10_000_000 },
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

export const CHECKLIST_PHASES = [
  { id: "12_plus_months", label: "12+ months out", sortOrder: 0 },
  { id: "9_12_months", label: "9 – 12 months", sortOrder: 1 },
  { id: "6_9_months", label: "6 – 9 months", sortOrder: 2 },
  { id: "3_6_months", label: "3 – 6 months", sortOrder: 3 },
  { id: "1_3_months", label: "1 – 3 months", sortOrder: 4 },
  { id: "final_weeks", label: "Final weeks", sortOrder: 5 },
  { id: "day_of", label: "Day-of", sortOrder: 6 },
] as const;

export const CHECKLIST_CATEGORIES = [
  { id: "venue", label: "Venue" },
  { id: "vendors", label: "Vendors" },
  { id: "attire", label: "Attire" },
  { id: "guests", label: "Guests" },
  { id: "ceremony", label: "Ceremony" },
  { id: "reception", label: "Reception" },
  { id: "legal", label: "Legal & admin" },
  { id: "other", label: "Other" },
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
export type ChecklistPhase = (typeof CHECKLIST_PHASES)[number]["id"];
export type ChecklistCategory = (typeof CHECKLIST_CATEGORIES)[number]["id"];
export type TaskEffort = (typeof TASK_EFFORT_LEVELS)[number]["id"];
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number]["id"];
export type VendorStatus = (typeof VENDOR_STATUSES)[number]["id"];
