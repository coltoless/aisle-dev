"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
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
    balance_due_date: row.balance_due_date,
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

  const patch: Database["public"]["Tables"]["budget_items"]["Update"] = {};

  if (data.category !== undefined) patch.category = data.category;
  if (data.category_label !== undefined) patch.category_label = data.category_label;
  if (data.balance_due_date !== undefined) patch.balance_due_date = data.balance_due_date;
  if (data.notes !== undefined) patch.notes = data.notes;
  if (data.sort_order !== undefined) patch.sort_order = data.sort_order;

  // Monetary inputs arrive in dollars from the client.
  if (data.estimated_cost !== undefined) patch.estimated_cost = dollarsToCentsOrNull(data.estimated_cost);
  if (data.quoted_cost !== undefined) patch.quoted_cost = dollarsToCentsOrNull(data.quoted_cost);
  if (data.deposit_paid !== undefined) patch.deposit_paid = dollarsToCentsOrNull(data.deposit_paid);

  // Keep stored balance_due non-negative for schedule queries.
  const q = patch.quoted_cost ?? undefined;
  const d = patch.deposit_paid ?? undefined;
  if (q !== undefined || d !== undefined) {
    const qNext = q ?? 0;
    const dNext = d ?? 0;
    patch.balance_due = Math.max(0, qNext - dNext);
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
      balance_due_date: data.balance_due_date?.trim() || null,
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

