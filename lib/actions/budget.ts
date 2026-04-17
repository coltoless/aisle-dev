"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { BudgetImportRow } from "@/lib/budget/import-budget-file";
import { normalizeBudgetDueDateStored } from "@/lib/budget/due-date";
import type { BudgetItem } from "@/types/index";
import type { Database } from "@/types/supabase";

async function serverDb(): Promise<SupabaseClient<Database>> {
  const client = await createClient();
  return client as unknown as SupabaseClient<Database>;
}

type BudgetRow = Database["public"]["Tables"]["budget_items"]["Row"];

function mapRow(row: BudgetRow): BudgetItem {
  return {
    id: row.id,
    couple_id: row.couple_id,
    category: row.category,
    category_label: row.category_label,
    estimated_cost: row.estimated_cost,
    quoted_cost: row.quoted_cost,
    deposit_paid: row.deposit_paid,
    balance_due: row.balance_due,
    balance_due_date: normalizeBudgetDueDateStored(row.balance_due_date),
    notes: row.notes,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function dollarsToCentsOrNull(v: number | null | undefined): number | null {
  if (v == null) return null;
  if (!Number.isFinite(v)) return null;
  const cents = Math.round(v * 100);
  return cents < 0 ? 0 : cents;
}

function slugifyCategoryId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replaceAll(/^_+|_+$/g, "")
    .slice(0, 60);
}

function normLabel(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export type AddBudgetItemData = {
  category_label: string;
  estimated_cost?: number | null; // dollars
  quoted_cost?: number | null; // dollars
  deposit_paid?: number | null; // dollars
  balance_due_date?: string | null;
  notes?: string | null;
};

export type UpdateBudgetItemData = {
  category?: string;
  category_label?: string;
  estimated_cost?: number | null; // dollars
  quoted_cost?: number | null; // dollars
  deposit_paid?: number | null; // dollars
  balance_due_date?: string | null;
  notes?: string | null;
  sort_order?: number;
};

export async function updateBudgetItem(id: string, data: UpdateBudgetItemData): Promise<BudgetItem> {
  const supabase = await serverDb();

  const { data: current, error: curErr } = await supabase
    .from("budget_items")
    .select("quoted_cost, deposit_paid")
    .eq("id", id)
    .single();
  if (curErr || !current) throw new Error(curErr?.message ?? "Not found");

  const patch: Database["public"]["Tables"]["budget_items"]["Update"] = {};

  if (data.category !== undefined) patch.category = data.category;
  if (data.category_label !== undefined) {
    patch.category_label = data.category_label;
    patch.category = data.category ?? (slugifyCategoryId(data.category_label) || "custom");
  }
  if (data.balance_due_date !== undefined) {
    patch.balance_due_date = normalizeBudgetDueDateStored(data.balance_due_date);
  }
  if (data.notes !== undefined) patch.notes = data.notes;
  if (data.sort_order !== undefined) patch.sort_order = data.sort_order;

  // Monetary inputs arrive in dollars from the client.
  if (data.estimated_cost !== undefined) patch.estimated_cost = dollarsToCentsOrNull(data.estimated_cost);
  if (data.quoted_cost !== undefined) patch.quoted_cost = dollarsToCentsOrNull(data.quoted_cost);
  if (data.deposit_paid !== undefined) patch.deposit_paid = dollarsToCentsOrNull(data.deposit_paid);

  if (data.quoted_cost !== undefined || data.deposit_paid !== undefined) {
    const qEff =
      patch.quoted_cost !== undefined ? patch.quoted_cost : current.quoted_cost;
    const dEff =
      patch.deposit_paid !== undefined ? patch.deposit_paid : current.deposit_paid;
    patch.balance_due = Math.max(0, (qEff ?? 0) - (dEff ?? 0));
  }

  const { data: row, error } = await supabase.from("budget_items").update(patch).eq("id", id).select().single();
  if (error || !row) throw new Error(error?.message ?? "Update failed");
  return mapRow(row);
}

export async function addBudgetItem(coupleId: string, data: AddBudgetItemData): Promise<BudgetItem> {
  const supabase = await serverDb();

  const categoryLabel = data.category_label.trim();
  if (!categoryLabel) throw new Error("Category name is required");

  const { data: maxRow } = await supabase
    .from("budget_items")
    .select("sort_order")
    .eq("couple_id", coupleId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSort = (maxRow?.sort_order ?? 0) + 1;

  const estimated = dollarsToCentsOrNull(data.estimated_cost);
  const quoted = dollarsToCentsOrNull(data.quoted_cost);
  const deposit = dollarsToCentsOrNull(data.deposit_paid);
  const balanceDue = Math.max(0, (quoted ?? 0) - (deposit ?? 0));

  const { data: inserted, error } = await supabase
    .from("budget_items")
    .insert({
      couple_id: coupleId,
      category: slugifyCategoryId(categoryLabel) || "custom",
      category_label: categoryLabel,
      estimated_cost: estimated,
      quoted_cost: quoted,
      deposit_paid: deposit,
      balance_due: balanceDue,
      balance_due_date: normalizeBudgetDueDateStored(data.balance_due_date),
      notes: data.notes?.trim() || null,
      sort_order: nextSort,
    })
    .select()
    .single();

  if (error || !inserted) throw new Error(error?.message ?? "Insert failed");
  return mapRow(inserted);
}

export async function deleteBudgetItem(id: string): Promise<void> {
  const supabase = await serverDb();
  const { error } = await supabase.from("budget_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

function findMatchingBudgetItemId(label: string, items: BudgetItem[]): string | null {
  const slug = slugifyCategoryId(label);
  const norm = normLabel(label);
  const hit = items.find(
    (e) => normLabel(e.category_label) === norm || e.category === slug,
  );
  return hit?.id ?? null;
}

function importRowToUpdatePayload(row: BudgetImportRow): UpdateBudgetItemData {
  const data: UpdateBudgetItemData = {
    category_label: row.category_label.trim(),
  };
  const pf = row.valueFieldsFromFile;
  if (pf.has("estimated_cost")) data.estimated_cost = row.estimated_cost ?? null;
  if (pf.has("quoted_cost")) data.quoted_cost = row.quoted_cost ?? null;
  if (pf.has("deposit_paid")) data.deposit_paid = row.deposit_paid ?? null;
  if (pf.has("balance_due_date")) {
    data.balance_due_date = normalizeBudgetDueDateStored(row.balance_due_date);
  }
  if (pf.has("notes")) data.notes = row.notes?.trim() || null;
  return data;
}

/**
 * Merges CSV/XLSX rows into budget_items: updates matching categories, inserts new ones.
 * Matching: same normalized label or same slug as `category`. Only columns present in the
 * file are updated (see `valueFieldsFromFile` on each row).
 */
export async function importBudgetItems(
  coupleId: string,
  rows: BudgetImportRow[],
): Promise<{ added: BudgetItem[]; updated: BudgetItem[]; skipped: number }> {
  const supabase = await serverDb();

  const { data: existingData, error: existingErr } = await supabase
    .from("budget_items")
    .select("*")
    .eq("couple_id", coupleId);
  if (existingErr) throw new Error(existingErr.message);

  let workingItems = (existingData ?? []).map(mapRow);
  const added: BudgetItem[] = [];
  const updated: BudgetItem[] = [];
  let skipped = 0;

  const toInsert: BudgetImportRow[] = [];
  const queuedNewNorms = new Set<string>();

  for (const r of rows) {
    const label = r.category_label?.trim() ?? "";
    if (!label) {
      skipped++;
      continue;
    }

    const id = findMatchingBudgetItemId(label, workingItems);
    if (id) {
      const updatedRow = await updateBudgetItem(id, importRowToUpdatePayload(r));
      updated.push(updatedRow);
      workingItems = workingItems.map((it) => (it.id === id ? updatedRow : it));
      continue;
    }

    const nk = normLabel(label);
    if (queuedNewNorms.has(nk)) {
      skipped++;
      continue;
    }
    queuedNewNorms.add(nk);
    toInsert.push(r);
  }

  if (toInsert.length === 0) {
    return { added, updated, skipped };
  }

  const { data: maxRow } = await supabase
    .from("budget_items")
    .select("sort_order")
    .eq("couple_id", coupleId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextSort = (maxRow?.sort_order ?? 0) + 1;

  const payload = toInsert.map((r) => {
    const estimated = dollarsToCentsOrNull(r.estimated_cost);
    const quoted = dollarsToCentsOrNull(r.quoted_cost);
    const deposit = dollarsToCentsOrNull(r.deposit_paid);
    const balanceDue = Math.max(0, (quoted ?? 0) - (deposit ?? 0));
    const row = {
      couple_id: coupleId,
      category: slugifyCategoryId(r.category_label) || "custom",
      category_label: r.category_label.trim(),
      estimated_cost: estimated,
      quoted_cost: quoted,
      deposit_paid: deposit,
      balance_due: balanceDue,
      balance_due_date: normalizeBudgetDueDateStored(r.balance_due_date),
      notes: r.notes?.trim() || null,
      sort_order: nextSort,
    };
    nextSort++;
    return row;
  });

  const { data: inserted, error } = await supabase.from("budget_items").insert(payload).select();
  if (error || !inserted) throw new Error(error?.message ?? "Import insert failed");

  added.push(...inserted.map(mapRow));

  return { added, updated, skipped };
}

export async function deleteBudgetFlag(id: string): Promise<void> {
  const supabase = await serverDb();
  const { error } = await supabase.from("budget_flags").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

