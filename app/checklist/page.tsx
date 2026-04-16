import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ChecklistView } from "@/components/checklist/ChecklistView";
import { getCurrentPhase } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ChecklistItem } from "@/types/index";
import type { Database } from "@/types/supabase";

export const metadata: Metadata = {
  title: "Planning Checklist | Aisle",
};

type ChecklistRow = Database["public"]["Tables"]["checklist_items"]["Row"];

function mapRow(row: ChecklistRow): ChecklistItem {
  return {
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
  };
}

export default async function ChecklistPage() {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase.from("couples").select("id").eq("user_id", user.id).maybeSingle();
  if (!couple) redirect("/onboarding/1");

  const { data: profile } = await supabase
    .from("wedding_profiles")
    .select("wedding_date")
    .eq("couple_id", couple.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/1");

  const { data: rows } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("couple_id", couple.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const items = (rows ?? []).map(mapRow);
  const currentPhase = getCurrentPhase(profile.wedding_date);

  return <ChecklistView items={items} currentPhase={currentPhase} weddingDate={profile.wedding_date} />;
}
