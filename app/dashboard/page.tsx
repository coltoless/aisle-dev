import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import {
  budgetTotalCentsFromProfile,
  buildDashboardSubline,
  committedCentsForRow,
  getCurrentChecklistPhase,
  isVendorBooked,
  startOfTodayUtcDateString,
  totalCommittedCents,
  type BudgetItemRow,
} from "@/lib/dashboard/dashboard-data";
import { createClient } from "@/lib/supabase/server";
import type { ChecklistItem, Vendor, WeddingProfile } from "@/types/index";
import type { Database } from "@/types/supabase";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { title: "Dashboard | Aisle" };
  }
  const { data: couple } = await supabase
    .from("couples")
    .select("partner1_name, partner2_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const p1 = couple?.partner1_name?.trim() || "Your";
  const p2 = couple?.partner2_name?.trim() || "Wedding";
  return { title: `${p1} & ${p2}'s Wedding | Aisle` };
}

function sortIncompleteByDue(a: ChecklistItem, b: ChecklistItem): number {
  if (!a.due_date && !b.due_date) return 0;
  if (!a.due_date) return 1;
  if (!b.due_date) return -1;
  return a.due_date.localeCompare(b.due_date);
}

export default async function DashboardPage() {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id, partner1_name, partner2_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!couple) redirect("/onboarding");

  const coupleId = couple.id;

  const [
    profileRes,
    checklistRes,
    budgetRes,
    vendorsRes,
    aiRes,
  ] = await Promise.all([
    supabase.from("wedding_profiles").select("*").eq("couple_id", coupleId).maybeSingle(),
    supabase.from("checklist_items").select("*").eq("couple_id", coupleId).order("sort_order", { ascending: true }),
    supabase.from("budget_items").select("*").eq("couple_id", coupleId).order("sort_order", { ascending: true }),
    supabase.from("vendors").select("*").eq("couple_id", coupleId).order("created_at", { ascending: true }),
    supabase
      .from("ai_conversations")
      .select("id, couple_id, role, content, created_at")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  void aiRes;

  const profileRow = profileRes.data;
  if (!profileRow) redirect("/onboarding");

  const weddingProfile: WeddingProfile = {
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
    onboarding_complete: profileRow.onboarding_complete,
    created_at: profileRow.created_at,
    updated_at: profileRow.updated_at,
  };

  const checklistItems: ChecklistItem[] = (checklistRes.data ?? []).map((row) => ({
    id: row.id,
    couple_id: row.couple_id,
    title: row.title,
    category: row.category as ChecklistItem["category"],
    phase: row.phase as ChecklistItem["phase"],
    due_date: row.due_date,
    completed: row.completed,
    completed_at: row.completed_at,
    snoozed_until: row.snoozed_until,
    notes: row.notes,
    effort: null,
    is_custom: row.is_custom,
    sort_order: row.sort_order,
    created_at: row.created_at,
  }));

  const budgetItems = (budgetRes.data ?? []) as BudgetItemRow[];

  const vendors: Vendor[] = (vendorsRes.data ?? []).map((row) => ({
    id: row.id,
    couple_id: row.couple_id,
    category: row.category,
    company_name: row.company_name,
    contact_name: row.contact_name,
    email: row.email,
    phone: row.phone,
    website: row.website,
    status: row.status as Vendor["status"],
    contract_uploaded: row.contract_uploaded,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  const today = startOfTodayUtcDateString();
  const incomplete = checklistItems.filter((i) => !i.completed);
  const overdueCount = incomplete.filter((i) => i.due_date && i.due_date < today).length;

  const completed = checklistItems.filter((i) => i.completed).length;
  const totalTasks = checklistItems.length;

  const committedCents = totalCommittedCents(budgetItems);
  const budgetTotalCents = budgetTotalCentsFromProfile(
    weddingProfile.budget_exact,
    weddingProfile.budget_range,
  );
  const remainingCents =
    budgetTotalCents != null ? Math.max(0, budgetTotalCents - committedCents) : 0;
  const rawBudgetPct =
    budgetTotalCents != null && budgetTotalCents > 0 ? (committedCents / budgetTotalCents) * 100 : 0;
  const overBudget = budgetTotalCents != null && committedCents > budgetTotalCents;
  const overNinetyPct = !overBudget && rawBudgetPct > 90;
  const progressPct = Math.min(100, rawBudgetPct);

  const bookedVendors = vendors.filter((v) => isVendorBooked(v.status));
  const bookedCategoryIds: string[] = [];
  const seenCat = new Set<string>();
  for (const v of bookedVendors) {
    if (!seenCat.has(v.category)) {
      seenCat.add(v.category);
      bookedCategoryIds.push(v.category);
    }
  }

  const phase = getCurrentChecklistPhase(weddingProfile.wedding_date);
  let firstIncompleteInCurrentPhase: ChecklistItem | null = null;
  if (phase) {
    const inPhase = incomplete.filter((i) => i.phase === phase).sort(sortIncompleteByDue);
    firstIncompleteInCurrentPhase = inPhase[0] ?? null;
  }
  if (!firstIncompleteInCurrentPhase) {
    firstIncompleteInCurrentPhase = [...incomplete].sort(sortIncompleteByDue)[0] ?? null;
  }

  const budgetCommittedOverEstimate = budgetItems.some(
    (row) => committedCentsForRow(row) > (row.estimated_cost ?? 0),
  );

  const hasPhotographerBooked = bookedVendors.some((v) => v.category === "photography");
  const hasVenueBooked = bookedVendors.some((v) => v.category === "venue");

  const partner1 = couple.partner1_name?.trim() || "Partner 1";
  const partner2 = couple.partner2_name?.trim() || "Partner 2";
  const subline = buildDashboardSubline(weddingProfile.wedding_date, weddingProfile);

  return (
    <DashboardHomeView
      partner1={partner1}
      partner2={partner2}
      subline={subline}
      checklistItems={checklistItems}
      budgetItems={budgetItems}
      weddingProfile={weddingProfile}
      checklistSummary={{
        overdueCount,
        firstIncompleteInCurrentPhase: firstIncompleteInCurrentPhase
          ? { title: firstIncompleteInCurrentPhase.title }
          : null,
        budgetCommittedOverEstimate,
      }}
      vendorSummary={{
        hasPhotographerBooked,
        hasVenueBooked,
      }}
      checklistStat={{ completed, total: totalTasks, overdue: overdueCount }}
      budgetStat={{
        committedCents,
        totalCents: budgetTotalCents,
        remainingCents,
        progressPct,
        overBudget,
        overNinetyPct,
      }}
      vendorStat={{
        booked: bookedVendors.length,
        total: vendors.length,
        bookedCategoryIds,
      }}
    />
  );
}
