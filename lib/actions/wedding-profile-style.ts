"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

async function serverDb(): Promise<SupabaseClient<Database>> {
  const client = await createClient();
  return client as unknown as SupabaseClient<Database>;
}

async function getCoupleId(): Promise<string> {
  const supabase = await serverDb();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: couple, error } = await supabase.from("couples").select("id").eq("user_id", user.id).maybeSingle();
  if (error || !couple?.id) throw new Error("No couple");
  return couple.id;
}

export async function saveVisionBoardToProfile(styleNotes: string): Promise<void> {
  const supabase = await serverDb();
  const coupleId = await getCoupleId();
  const { error } = await supabase
    .from("wedding_profiles")
    .update({ style_notes: styleNotes.trim(), updated_at: new Date().toISOString() })
    .eq("couple_id", coupleId);
  if (error) throw new Error(error.message);
}
