import { redirect } from "next/navigation";
import { BuddyPageClient } from "@/components/buddy/BuddyPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function BuddyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase.from("couples").select("id").eq("user_id", user.id).maybeSingle();
  const coupleId = (couple as { id: string } | null)?.id;
  if (!coupleId) redirect("/onboarding/1");

  return <BuddyPageClient coupleId={coupleId} />;
}
