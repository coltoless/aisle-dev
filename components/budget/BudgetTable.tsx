"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Pencil, TriangleAlert } from "lucide-react";
import { DEFAULT_BUDGET_CATEGORIES } from "@/lib/constants";
import { formatUsdFromCents } from "@/lib/dashboard/format-money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BudgetItem } from "@/types/index";

type BudgetTableProps = {
  items: BudgetItem[];
  totalBudget: number; // cents
  editingId: string | null;
  onEditingChange: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<BudgetItem>) => void;
  onEditRow: (item: BudgetItem) => void;
  onAdd: () => void;
};

function labelFor(item: BudgetItem): string {
  const fromDefaults = DEFAULT_BUDGET_CATEGORIES.find((c) => c.category === item.category)?.categoryLabel;
  return (fromDefaults || item.category_label || item.category).trim();
}

function dashIfNull(cents: number | null): string {
  if (cents == null) return "—";
  return formatUsdFromCents(cents);
}

function parseDollarsToCents(input: string): number | null {
  const raw = input.trim();
  if (!raw) return null;
  const normalized = raw.replaceAll(/[^0-9.-]/g, "");
  if (!normalized) return null;
  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
}

function centsToInputDollars(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(/\.00$/, "");
}

function daysUntil(iso: string): number | null {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(Date.UTC(y, m - 1, d));
  const today = new Date();
  const t = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  return Math.floor((target.getTime() - t.getTime()) / 86_400_000);
}

export function BudgetTable({
  items,
  totalBudget,
  editingId,
  onEditingChange,
  onUpdate,
  onEditRow,
  onAdd,
}: BudgetTableProps) {
  const totals = useMemo(() => {
    const est = items.reduce((s, r) => s + (r.estimated_cost ?? 0), 0);
    const quoted = items.reduce((s, r) => s + (r.quoted_cost ?? 0), 0);
    const deposit = items.reduce((s, r) => s + (r.deposit_paid ?? 0), 0);
    const balance = items.reduce((s, r) => {
      const q = r.quoted_cost;
      const d = r.deposit_paid;
      if (q == null && d == null) return s;
      return s + ((q ?? 0) - (d ?? 0));
    }, 0);
    void totalBudget;
    return { est, quoted, deposit, balance };
  }, [items, totalBudget]);

  return (
    <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-sm)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Categories
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              <th className="px-6 py-3">Category</th>
              <th className="px-4 py-3">Estimated</th>
              <th className="px-4 py-3">Quoted</th>
              <th className="px-4 py-3">Deposit Paid</th>
              <th className="px-4 py-3">Balance Due</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>

          <tbody>
            {items.map((row) => (
              <BudgetRow
                key={row.id}
                row={row}
                editing={editingId === row.id}
                onEditingChange={onEditingChange}
                onUpdate={onUpdate}
                onEditRow={onEditRow}
              />
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)]">
              <td className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-primary)]">
                TOTAL
              </td>
              <td className="px-4 py-4 font-semibold tabular-nums text-[var(--color-text-primary)]">
                {formatUsdFromCents(totals.est)}
              </td>
              <td className="px-4 py-4 font-semibold tabular-nums text-[var(--color-text-primary)]">
                {formatUsdFromCents(totals.quoted)}
              </td>
              <td className="px-4 py-4 font-semibold tabular-nums text-[var(--color-text-primary)]">
                {formatUsdFromCents(totals.deposit)}
              </td>
              <td
                className="px-4 py-4 font-semibold tabular-nums"
                style={{
                  color:
                    totals.balance > 0
                      ? "var(--color-danger)"
                      : totals.balance < 0
                        ? "var(--color-success)"
                        : "var(--color-text-primary)",
                }}
              >
                {formatUsdFromCents(totals.balance)}
              </td>
              <td className="px-4 py-4" />
              <td className="px-4 py-4" />
              <td className="px-3 py-4" />
            </tr>

            <tr>
              <td colSpan={8} className="px-6 py-4">
                <Button type="button" variant="outline" className="w-full" onClick={onAdd}>
                  + Add Category
                </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function BudgetRow({
  row,
  editing,
  onEditingChange,
  onUpdate,
  onEditRow,
}: {
  row: BudgetItem;
  editing: boolean;
  onEditingChange: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<BudgetItem>) => void;
  onEditRow: (item: BudgetItem) => void;
}) {
  const [est, setEst] = useState(centsToInputDollars(row.estimated_cost));
  const [quoted, setQuoted] = useState(centsToInputDollars(row.quoted_cost));
  const [deposit, setDeposit] = useState(centsToInputDollars(row.deposit_paid));
  const [due, setDue] = useState(row.balance_due_date ?? "");
  const [notes, setNotes] = useState(row.notes ?? "");

  useEffect(() => {
    if (!editing) return;
    setEst(centsToInputDollars(row.estimated_cost));
    setQuoted(centsToInputDollars(row.quoted_cost));
    setDeposit(centsToInputDollars(row.deposit_paid));
    setDue(row.balance_due_date ?? "");
    setNotes(row.notes ?? "");
  }, [editing, row]);

  const qCents = row.quoted_cost;
  const eCents = row.estimated_cost;
  const overBudget = qCents != null && eCents != null && qCents > eCents;

  const balanceDisplay =
    row.quoted_cost == null && row.deposit_paid == null
      ? null
      : (row.quoted_cost ?? 0) - (row.deposit_paid ?? 0);

  const dueSoon =
    row.balance_due_date &&
    balanceDisplay != null &&
    balanceDisplay > 0 &&
    (() => {
      const d = daysUntil(row.balance_due_date!);
      return d != null && d <= 14 && d >= 0;
    })();

  const save = () => {
    const patch: Partial<BudgetItem> = {
      estimated_cost: parseDollarsToCents(est),
      quoted_cost: parseDollarsToCents(quoted),
      deposit_paid: parseDollarsToCents(deposit),
      balance_due_date: due.trim() || null,
      notes: notes.trim() || null,
    };

    onUpdate(row.id, patch);
    onEditingChange(null);
  };

  const onKeyDownSave: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onEditingChange(null);
    }
  };

  return (
    <tr
      className={cn(
        "group border-t border-[var(--color-border)] transition-colors",
        editing && "bg-[rgba(29,78,216,0.06)]",
        !editing && "hover:bg-[rgba(0,0,0,0.03)]",
        overBudget && "border-l-4 border-l-[rgba(180,83,9,0.35)]",
      )}
      onClick={() => {
        if (!editing) onEditingChange(row.id);
      }}
    >
      <td className="px-6 py-3">
        <div className="font-medium text-[var(--color-text-primary)]">{labelFor(row)}</div>
      </td>

      <td className="px-4 py-3 tabular-nums">
        {editing ? (
          <Input
            inputMode="decimal"
            value={est}
            onChange={(e) => setEst(e.target.value)}
            onBlur={save}
            onKeyDown={onKeyDownSave}
            className="h-8"
            placeholder="—"
          />
        ) : (
          <span className={cn("text-[var(--color-text-primary)]", row.estimated_cost == null && "text-[var(--color-text-muted)]")}>
            {dashIfNull(row.estimated_cost)}
          </span>
        )}
      </td>

      <td className="px-4 py-3 tabular-nums">
        {editing ? (
          <Input
            inputMode="decimal"
            value={quoted}
            onChange={(e) => setQuoted(e.target.value)}
            onBlur={save}
            onKeyDown={onKeyDownSave}
            className="h-8"
            placeholder="—"
          />
        ) : (
          <span
            className={cn(
              row.quoted_cost == null ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]",
              overBudget && "text-[var(--color-warning)]",
            )}
          >
            {dashIfNull(row.quoted_cost)}
            {overBudget ? (
              <span className="ml-2 inline-flex items-center align-middle">
                <TriangleAlert className="size-4 text-[var(--color-warning)]" aria-hidden />
              </span>
            ) : null}
          </span>
        )}
      </td>

      <td className="px-4 py-3 tabular-nums">
        {editing ? (
          <Input
            inputMode="decimal"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            onBlur={save}
            onKeyDown={onKeyDownSave}
            className="h-8"
            placeholder="—"
          />
        ) : (
          <span className={cn(row.deposit_paid == null ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]")}>
            {dashIfNull(row.deposit_paid)}
          </span>
        )}
      </td>

      <td className="px-4 py-3 tabular-nums">
        {balanceDisplay == null ? (
          <span className="text-[var(--color-text-muted)]">—</span>
        ) : (
          <span
            className={cn(
              "text-[var(--color-text-primary)]",
              balanceDisplay < 0 && "text-[color-mix(in oklab, var(--color-success) 70%, var(--color-text-muted) 30%)]",
            )}
          >
            {formatUsdFromCents(balanceDisplay)}
          </span>
        )}
      </td>

      <td className="px-4 py-3">
        {editing ? (
          <Input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            onBlur={save}
            onKeyDown={onKeyDownSave}
            className="h-8"
          />
        ) : row.balance_due_date ? (
          <span className={cn("inline-flex items-center gap-1.5", dueSoon && "text-[var(--color-warning)]")}>
            {row.balance_due_date}
            {dueSoon ? <Clock className="size-4" aria-hidden /> : null}
          </span>
        ) : (
          <span className="text-[var(--color-text-muted)]">—</span>
        )}
      </td>

      <td className="px-4 py-3">
        {editing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={save}
            onKeyDown={onKeyDownSave}
            rows={1}
            className="h-8 w-full resize-none rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
            placeholder="—"
          />
        ) : row.notes ? (
          <span
            title={row.notes}
            className="block max-w-[360px] truncate text-[var(--color-text-primary)]"
          >
            {row.notes.length > 40 ? `${row.notes.slice(0, 40)}…` : row.notes}
          </span>
        ) : (
          <span className="text-[var(--color-text-muted)]">—</span>
        )}
      </td>

      <td className="px-3 py-3 text-right">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={cn(
              "rounded-md p-2 text-[var(--color-text-muted)] opacity-0 transition-opacity hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]",
              editing && "opacity-100",
              !editing && "group-hover:opacity-100",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onEditRow(row);
            }}
            aria-label="Edit category details"
          >
            <Pencil className="size-4" aria-hidden />
          </button>
        </div>
      </td>
    </tr>
  );
}

