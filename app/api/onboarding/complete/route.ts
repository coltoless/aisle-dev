import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api/responses";
import {
  BUDGET_RANGES,
  DEFAULT_BUDGET_CATEGORIES,
  DEFAULT_CHECKLIST_ITEMS,
  GUEST_COUNT_RANGES,
  getSuggestedDueDate,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { AppDatabase } from "@/types/database-app";
import type { OnboardingCompleteRequest, OnboardingCompleteResponse } from "@/types/api";
import type { Database } from "@/types/supabase";

const GUEST_IDS = new Set<string>(GUEST_COUNT_RANGES.map((g) => g.id));
const BUDGET_IDS = new Set<string>(BUDGET_RANGES.map((b) => b.id));

type CoupleInsert = Database["public"]["Tables"]["couples"]["Insert"];
type ProfileInsert = Database["public"]["Tables"]["wedding_profiles"]["Insert"];
type ChecklistInsert = Database["public"]["Tables"]["checklist_items"]["Insert"];
type BudgetInsert = Database["public"]["Tables"]["budget_items"]["Insert"];

function isOnboardingComplete(body: unknown): body is OnboardingCompleteRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  if (typeof b.partner1Name !== "string" || !b.partner1Name.trim()) return false;
  if (typeof b.partner2Name !== "string" || !b.partner2Name.trim()) return false;
  if (b.weddingDate !== null && typeof b.weddingDate !== "string") return false;
  if (typeof b.locationCity !== "string" || !b.locationCity.trim()) return false;
  if (typeof b.locationState !== "string" || !b.locationState.trim()) return false;
  if (typeof b.locationCountry !== "string" || !b.locationCountry.trim()) return false;
  if (typeof b.guestCountRange !== "string" || !GUEST_IDS.has(b.guestCountRange)) return false;
  if (typeof b.budgetRange !== "string" || !BUDGET_IDS.has(b.budgetRange)) return false;
  if (b.budgetExact !== undefined && b.budgetExact !== null && typeof b.budgetExact !== "number")
    return false;
  if (!Array.isArray(b.styleTags) || !b.styleTags.every((t) => typeof t === "string")) return false;
  if (!Array.isArray(b.priorities) || b.priorities.length !== 8 || !b.priorities.every((p) => typeof p === "string"))
    return false;
  return true;
}

function budgetTotalCents(body: OnboardingCompleteRequest): number {
  if (body.budgetExact != null && body.budgetExact > 0) {
    return Math.round(body.budgetExact);
  }
  const range = BUDGET_RANGES.find((r) => r.id === body.budgetRange);
  return range?.midpointCents ?? 0;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON", { code: "INVALID_JSON" });
  }

  if (!isOnboardingComplete(body)) {
    return jsonError(400, "Invalid onboarding payload", { code: "INVALID_BODY" });
  }

  const supabase = (await createClient()) as unknown as SupabaseClient<AppDatabase>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError(401, "Unauthorized", { code: "UNAUTHORIZED" });
  }

  const { data: existing } = await supabase
    .from("couples")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return jsonError(409, "Onboarding already completed for this account", { code: "COUPLE_EXISTS" });
  }

  const email = user.email?.trim() || "";
  if (!email) {
    return jsonError(400, "Account email is required to create your couple record", { code: "NO_EMAIL" });
  }

  const coupleRow: CoupleInsert = {
    user_id: user.id,
    partner1_name: body.partner1Name.trim(),
    partner2_name: body.partner2Name.trim(),
    email,
  };

  const { data: couple, error: coupleError } = await supabase
    .from("couples")
    .insert(coupleRow)
    .select("id")
    .single();

  if (coupleError || !couple) {
    return jsonError(500, coupleError?.message ?? "Could not create couple", { code: "COUPLE_INSERT" });
  }

  const coupleId = couple.id;
  const budgetExactCents = budgetTotalCents(body);

  const profileRow: ProfileInsert = {
    couple_id: coupleId,
    wedding_date: body.weddingDate,
    location_city: body.locationCity.trim(),
    location_state: body.locationState.trim(),
    location_country: body.locationCountry.trim(),
    guest_count_range: body.guestCountRange,
    budget_range: body.budgetRange,
    budget_exact: budgetExactCents > 0 ? budgetExactCents : null,
    style_tags: body.styleTags,
    priorities: body.priorities,
    onboarding_complete: true,
    updated_at: new Date().toISOString(),
  };

  const { data: profile, error: profileError } = await supabase
    .from("wedding_profiles")
    .insert(profileRow)
    .select("id")
    .single();

  if (profileError || !profile) {
    await supabase.from("couples").delete().eq("id", coupleId);
    return jsonError(500, profileError?.message ?? "Could not create profile", { code: "PROFILE_INSERT" });
  }

  const profileId = profile.id;
  const weddingDate = body.weddingDate;

  const checklistRows: ChecklistInsert[] = DEFAULT_CHECKLIST_ITEMS.map((item) => ({
    couple_id: coupleId,
    title: item.title,
    category: item.category,
    phase: item.phase,
    due_date: getSuggestedDueDate(item.phase, weddingDate),
    notes: item.notes,
    is_custom: false,
    sort_order: item.sortOrder,
  }));

  const { error: checklistError } = await supabase.from("checklist_items").insert(checklistRows);

  if (checklistError) {
    await supabase.from("wedding_profiles").delete().eq("id", profileId);
    await supabase.from("couples").delete().eq("id", coupleId);
    return jsonError(500, checklistError.message, { code: "CHECKLIST_INSERT" });
  }

  const budgetRows: BudgetInsert[] = DEFAULT_BUDGET_CATEGORIES.map((row, index) => ({
    couple_id: coupleId,
    category: row.category,
    category_label: row.categoryLabel,
    estimated_cost:
      budgetExactCents > 0
        ? Math.max(0, Math.round((row.defaultAllocationPct / 100) * budgetExactCents))
        : null,
    sort_order: index + 1,
    updated_at: new Date().toISOString(),
  }));

  const { error: budgetError } = await supabase.from("budget_items").insert(budgetRows);

  if (budgetError) {
    await supabase.from("checklist_items").delete().eq("couple_id", coupleId);
    await supabase.from("wedding_profiles").delete().eq("id", profileId);
    await supabase.from("couples").delete().eq("id", coupleId);
    return jsonError(500, budgetError.message, { code: "BUDGET_INSERT" });
  }

  const payload: OnboardingCompleteResponse = {
    coupleId,
    weddingProfileId: profileId,
    checklistItemsCreated: DEFAULT_CHECKLIST_ITEMS.length,
    budgetItemsCreated: DEFAULT_BUDGET_CATEGORIES.length,
    aiIntroMessage: "",
  };

  return jsonOk(payload);
}
