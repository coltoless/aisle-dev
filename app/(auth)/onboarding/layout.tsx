import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingChrome } from "@/components/onboarding/onboarding-chrome";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Onboarding — Aisle",
};

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: couple } = await supabase.from("couples").select("id").eq("user_id", user.id).maybeSingle();

  if (couple) {
    redirect("/dashboard");
  }

  return <OnboardingChrome>{children}</OnboardingChrome>;
}
