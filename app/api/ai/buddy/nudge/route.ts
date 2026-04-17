import type { SupabaseClient } from "@supabase/supabase-js";
import { jsonError } from "@/lib/api/responses";
import { buildProactiveNudge } from "@/lib/ai/prompts";
import { fetchWeddingContextForBuddy } from "@/lib/ai/buddy-context";
import { createClient } from "@/lib/supabase/server";
import type { AppDatabase } from "@/types/database-app";

export async function GET() {
  const supabase = (await createClient()) as unknown as SupabaseClient<AppDatabase>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError(401, "Unauthorized", { code: "UNAUTHORIZED" });
  }

  const { data: couple, error: coupleErr } = await supabase
    .from("couples")
    .select("id, partner1_name, partner2_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (coupleErr || !couple) {
    return jsonError(401, "No couple record", { code: "UNAUTHORIZED" });
  }

  const c = couple as { id: string; partner1_name: string; partner2_name: string };
  const ctx = await fetchWeddingContextForBuddy(supabase, c.id, c.partner1_name, c.partner2_name);

  if (!ctx) {
    return Response.json({ nudge: null });
  }

  const nudge = buildProactiveNudge(ctx);
  return Response.json({ nudge });
}
