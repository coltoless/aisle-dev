"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

async function serverDb(): Promise<SupabaseClient<Database>> {
  const client = await createClient();
  return client as unknown as SupabaseClient<Database>;
}

export async function appendVendorNotes(vendorId: string, append: string): Promise<void> {
  const supabase = await serverDb();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: row, error: fetchErr } = await supabase
    .from("vendors")
    .select("id, notes, couple_id")
    .eq("id", vendorId)
    .maybeSingle();

  if (fetchErr || !row) throw new Error("Vendor not found");

  const { data: couple } = await supabase.from("couples").select("id").eq("user_id", user.id).maybeSingle();
  if (!couple || couple.id !== row.couple_id) throw new Error("Forbidden");

  const prev = row.notes?.trim() ?? "";
  const next = prev ? `${prev}\n\n---\n\n${append.trim()}` : append.trim();

  const { error } = await supabase.from("vendors").update({ notes: next, updated_at: new Date().toISOString() }).eq("id", vendorId);
  if (error) throw new Error(error.message);
}
