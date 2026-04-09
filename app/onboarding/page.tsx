import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
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

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] px-5 py-16">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-display text-4xl font-semibold text-[var(--color-text-primary)]">Aisle</p>
        <h1 className="mt-8 font-display text-3xl font-semibold text-[var(--color-text-primary)]">
          Let&apos;s plan your wedding
        </h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">
          Onboarding will walk you through partners, date, and priorities. This is a placeholder screen.
        </p>
      </div>
    </div>
  );
}
