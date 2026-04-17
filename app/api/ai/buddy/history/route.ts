import type { SupabaseClient } from "@supabase/supabase-js";
import { jsonError } from "@/lib/api/responses";
import { createClient } from "@/lib/supabase/server";
import type { BuddyChatMode, BuddyMessage } from "@/types/api";
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
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (coupleErr || !couple) {
    return jsonError(401, "No couple record", { code: "UNAUTHORIZED" });
  }

  const coupleId = (couple as { id: string }).id;

  const { data: rows, error } = await supabase
    .from("ai_conversations")
    .select("id, role, content, created_at, mode")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return jsonError(500, error.message, { code: "FETCH_FAILED" });
  }

  const ordered = [...(rows ?? [])].reverse();

  const messages: BuddyMessage[] = ordered.map((r) => ({
    id: r.id,
    sourceId: r.id,
    role: r.role as "user" | "assistant",
    content: r.content,
    createdAt: r.created_at,
    mode: (r.mode ?? "planning") as BuddyChatMode,
  }));

  return Response.json({ messages });
}
