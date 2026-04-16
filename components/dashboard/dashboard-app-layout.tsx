import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { weddingSidebarCopy } from "@/lib/dashboard/wedding-display";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type CoupleSidebar = Pick<
  Database["public"]["Tables"]["couples"]["Row"],
  "id" | "partner1_name" | "partner2_name"
>;

export default async function DashboardAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const coupleRes = await supabase
    .from("couples")
    .select("id, partner1_name, partner2_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const couple = coupleRes.data as CoupleSidebar | null;

  if (!couple) {
    redirect("/onboarding/1");
  }

  const profileRes = await supabase
    .from("wedding_profiles")
    .select("wedding_date")
    .eq("couple_id", couple.id)
    .maybeSingle();

  const profile = profileRes.data as
    | Pick<Database["public"]["Tables"]["wedding_profiles"]["Row"], "wedding_date">
    | null;

  const { countdownLabel, dateLine } = weddingSidebarCopy(profile?.wedding_date ?? null);

  return (
    <DashboardShell
      partner1={couple.partner1_name}
      partner2={couple.partner2_name}
      countdownLabel={countdownLabel}
      weddingDateLabel={dateLine}
    >
      {children}
    </DashboardShell>
  );
}
