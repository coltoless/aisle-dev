"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { AddChecklistItemRequest } from "@/types/api";
import type { ChecklistItem } from "@/types/index";
import type { Database } from "@/types/supabase";

async function serverDb(): Promise<SupabaseClient<Database>> {
  const client = await createClient();
  return client as unknown as SupabaseClient<Database>;
}

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

export async function completeTask(id: string, completed: boolean): Promise<ChecklistItem> {
  const supabase = await serverDb();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("checklist_items")
    .update({
      completed,
      completed_at: completed ? now : null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Update failed");
  return mapRow(data);
}

export async function snoozeTask(id: string, until: Date): Promise<ChecklistItem> {
  const supabase = await serverDb();
  const y = until.getFullYear();
  const m = String(until.getMonth() + 1).padStart(2, "0");
  const d = String(until.getDate()).padStart(2, "0");
  const iso = `${y}-${m}-${d}`;
  const { data, error } = await supabase.from("checklist_items").update({ snoozed_until: iso }).eq("id", id).select().single();
  if (error || !data) throw new Error(error?.message ?? "Snooze failed");
  return mapRow(data);
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addTask(input: Omit<AddChecklistItemRequest, "coupleId">): Promise<ChecklistItem> {
  const supabase = await serverDb();
  const coupleId = await getCoupleId();
  const { data: maxRow } = await supabase
    .from("checklist_items")
    .select("sort_order")
    .eq("couple_id", coupleId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSort = (maxRow?.sort_order ?? 0) + 1;
  const { data: inserted, error } = await supabase
    .from("checklist_items")
    .insert({
      couple_id: coupleId,
      title: input.title.trim(),
      category: input.category,
      phase: input.phase,
      due_date: input.due_date?.trim() || null,
      notes: input.notes?.trim() || null,
      is_custom: input.is_custom,
      sort_order: nextSort,
      completed: false,
    })
    .select()
    .single();
  if (error || !inserted) throw new Error(error?.message ?? "Insert failed");
  return mapRow(inserted);
}

export async function updateTask(id: string, data: Partial<ChecklistItem>): Promise<ChecklistItem> {
  const supabase = await serverDb();
  const patch: Database["public"]["Tables"]["checklist_items"]["Update"] = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.category !== undefined && data.category !== null) patch.category = data.category;
  if (data.phase !== undefined && data.phase !== null) patch.phase = data.phase;
  if (data.due_date !== undefined) patch.due_date = data.due_date;
  if (data.notes !== undefined) patch.notes = data.notes;
  const { data: row, error } = await supabase.from("checklist_items").update(patch).eq("id", id).select().single();
  if (error || !row) throw new Error(error?.message ?? "Update failed");
  return mapRow(row);
}
