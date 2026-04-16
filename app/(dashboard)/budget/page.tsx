import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BudgetView } from "@/components/budget/BudgetView";
import { budgetTotalCentsFromProfile } from "@/lib/dashboard/dashboard-data";
import { createClient } from "@/lib/supabase/server";
import type { BudgetItem, WeddingProfile } from "@/types/index";
import type { Database } from "@/types/supabase";

export const metadata: Metadata = {
  title: "Budget Tracker | Aisle",
};

export default async function BudgetPage() {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!couple?.id) redirect("/onboarding");
  const coupleId = couple.id;

  const [itemsRes, profileRes] = await Promise.all([
    supabase
      .from("budget_items")
      .select("*")
      .eq("couple_id", coupleId)
      .order("sort_order", { ascending: true }),
    supabase.from("wedding_profiles").select("*").eq("couple_id", coupleId).maybeSingle(),
  ]);

  const items = (itemsRes.data ?? []) as unknown as BudgetItem[];
  const profileRow = profileRes.data;
  if (!profileRow) redirect("/onboarding");

  const weddingProfile: Pick<WeddingProfile, "wedding_date" | "budget_exact" | "budget_range"> = {
    wedding_date: profileRow.wedding_date,
    budget_exact: profileRow.budget_exact,
    budget_range: profileRow.budget_range as WeddingProfile["budget_range"],
  };

  const totalBudget = budgetTotalCentsFromProfile(
    weddingProfile.budget_exact,
    weddingProfile.budget_range,
  );

  return (
    <BudgetView
      coupleId={coupleId}
      items={items}
      totalBudget={totalBudget ?? 0}
      weddingDate={weddingProfile.wedding_date}
    />
  );
}
