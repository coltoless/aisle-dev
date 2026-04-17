/**
 * Shared domain types for Aisle (aligns with Supabase schema + app enums).
 */

import type {
  BudgetRange,
  ChecklistCategory,
  ChecklistPhase,
  GuestCountRange,
  PriorityCategory,
  StyleTag,
  VendorStatus,
  TaskEffort,
} from "@/lib/constants";

export type {
  BudgetRange,
  ChecklistCategory,
  ChecklistPhase,
  GuestCountRange,
  PriorityCategory,
  StyleTag,
  VendorStatus,
  TaskEffort,
};

export type VenueStatus = "considering" | "dismissed" | "booked";

export interface Couple {
  id: string;
  user_id: string;
  partner1_name: string | null;
  partner2_name: string | null;
  email: string | null;
  created_at: string;
}

export interface WeddingProfile {
  id: string;
  couple_id: string;
  wedding_date: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  guest_count_range: GuestCountRange | null;
  budget_range: BudgetRange | null;
  budget_exact: number | null;
  style_tags: StyleTag[] | null;
  priorities: PriorityCategory[] | null;
  /** Free-form vision / mood notes from AI Buddy vision board */
  style_notes: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  couple_id: string;
  title: string;
  category: ChecklistCategory | null;
  phase: ChecklistPhase | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  snoozed_until: string | null;
  notes: string | null;
  effort: TaskEffort | null;
  is_custom: boolean;
  sort_order: number;
  created_at: string;
}

export interface BudgetItem {
  id: string;
  couple_id: string;
  category: string;
  category_label: string;
  estimated_cost: number | null;
  quoted_cost: number | null;
  deposit_paid: number | null;
  balance_due: number | null;
  balance_due_date: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  couple_id: string;
  category: string;
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: VendorStatus;
  contract_uploaded: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  couple_id: string;
  vendor_id: string | null;
  vendor_name: string | null;
  file_path: string | null;
  file_name: string | null;
  contract_value: number | null;
  deposit_amount: number | null;
  deposit_due_date: string | null;
  balance_due_date: string | null;
  signed: boolean;
  ai_review_notes: string | null;
  uploaded_at: string;
}

export interface Venue {
  id: string;
  couple_id: string;
  name: string;
  location: string | null;
  venue_type: string | null;
  estimated_price_low: number | null;
  estimated_price_high: number | null;
  description: string | null;
  website: string | null;
  style_tags: string[] | null;
  status: VenueStatus;
  notes: string | null;
  created_at: string;
}

export interface AIConversationMessage {
  id: string;
  couple_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  mode?: "planning" | "vendor_email" | "vision_board" | "timeline";
}
