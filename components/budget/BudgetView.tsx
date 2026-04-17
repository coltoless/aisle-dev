"use client";

import { useMemo, useRef, useState, useTransition, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetDonutChart } from "@/components/budget/BudgetDonutChart";
import { BudgetTable } from "@/components/budget/BudgetTable";
import { PaymentSchedule } from "@/components/budget/PaymentSchedule";
import { AddBudgetItemModal } from "@/components/budget/AddBudgetItemModal";
import { formatUsdFromCents } from "@/lib/dashboard/format-money";
import { parseBudgetImportCsv, parseBudgetImportXlsx } from "@/lib/budget/import-budget-file";
import { importBudgetItems, updateBudgetItem } from "@/lib/actions/budget";
import { useToast } from "@/hooks/use-toast";
import type { BudgetItem } from "@/types/index";

type BudgetViewProps = {
  coupleId: string;
  items: BudgetItem[];
  totalBudget: number; // cents
  weddingDate: string | null;
};

function centsOrZero(v: number | null | undefined): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function committedCents(row: BudgetItem): number {
  const quoted = row.quoted_cost;
  if (quoted != null && quoted > 0) return quoted;
  return centsOrZero(row.estimated_cost);
}

function formatCsvNumberFromCents(cents: number | null): string {
  if (cents == null) return "";
  const dollars = cents / 100;
  if (!Number.isFinite(dollars)) return "";
  return dollars.toFixed(2);
}

function escapeCsvCell(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function BudgetView({ coupleId, items: initialItems, totalBudget, weddingDate }: BudgetViewProps) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<BudgetItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<BudgetItem | null>(null);

  const totals = useMemo(() => {
    const committed = items.reduce((s, r) => s + committedCents(r), 0);
    const remaining = totalBudget - committed;
    return { committed, remaining };
  }, [items, totalBudget]);

  const exportCsv = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    const header = [
      "Category",
      "Estimated Cost",
      "Quoted Cost",
      "Deposit Paid",
      "Balance Due",
      "Due Date",
      "Notes",
    ];

    const rows = items.map((r) => [
      r.category_label?.trim() || r.category,
      formatCsvNumberFromCents(r.estimated_cost),
      formatCsvNumberFromCents(r.quoted_cost),
      formatCsvNumberFromCents(r.deposit_paid),
      formatCsvNumberFromCents(r.balance_due),
      r.balance_due_date ?? "",
      r.notes ?? "",
    ]);

    const csv =
      [header, ...rows]
        .map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(","))
        .join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aisle-budget-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const openImportPicker = () => importInputRef.current?.click();

  const onImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const buf = await file.arrayBuffer();
      const lower = file.name.toLowerCase();
      const rows =
        lower.endsWith(".csv") || file.type === "text/csv"
          ? parseBudgetImportCsv(new TextDecoder("utf-8").decode(buf))
          : await parseBudgetImportXlsx(buf);

      if (rows.length === 0) {
        toast({
          variant: "destructive",
          title: "No rows to import",
          description: "Use a header row with a Category column (CSV or XLSX).",
        });
        return;
      }

      startTransition(async () => {
        try {
          const { added, updated, skipped } = await importBudgetItems(coupleId, rows);
          if (added.length || updated.length) {
            setItems((prev) => {
              const byId = new Map(prev.map((i) => [i.id, i]));
              for (const u of updated) byId.set(u.id, u);
              for (const a of added) byId.set(a.id, a);
              return Array.from(byId.values()).sort((a, b) => a.sort_order - b.sort_order);
            });
          }
          const parts: string[] = [];
          if (added.length)
            parts.push(`${added.length} new categor${added.length === 1 ? "y" : "ies"}`);
          if (updated.length)
            parts.push(`${updated.length} updated`);
          if (skipped > 0) parts.push(`${skipped} skipped`);
          toast({
            title:
              added.length || updated.length
                ? `Import complete${parts.length ? `: ${parts.join(" · ")}` : ""}`
                : "No changes from import",
            description:
              skipped > 0 && !added.length && !updated.length
                ? `${skipped} row${skipped === 1 ? "" : "s"} skipped (empty category, duplicate in file, or no matching columns).`
                : skipped > 0
                  ? `${skipped} row${skipped === 1 ? "" : "s"} skipped (empty category or duplicate in file).`
                  : undefined,
          });
        } catch (err) {
          toast({
            variant: "destructive",
            title: "Import failed",
            description: err instanceof Error ? err.message : "Try again.",
          });
        }
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not read file",
        description: err instanceof Error ? err.message : "Try a .csv or .xlsx file.",
      });
    }
  };

  const openAdd = () => {
    setModalItem(null);
    setModalOpen(true);
  };

  const openEdit = (item: BudgetItem) => {
    setModalItem(item);
    setModalOpen(true);
  };

  const handleUpsertLocal = (row: BudgetItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === row.id);
      if (idx === -1) return [...prev, row].sort((a, b) => a.sort_order - b.sort_order);
      const next = prev.slice();
      next[idx] = row;
      return next;
    });
  };

  const handleUpdateLocal = (id: string, patch: Partial<BudgetItem>) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleUpdate = (id: string, patch: Partial<BudgetItem>) => {
    // Optimistic update (patch is in cents for money fields).
    handleUpdateLocal(id, patch);

    startTransition(async () => {
      try {
        const toDollars = (cents: number | null | undefined) =>
          cents == null ? null : Number.isFinite(cents) ? cents / 100 : null;

        const saved = await updateBudgetItem(id, {
          estimated_cost:
            patch.estimated_cost !== undefined ? toDollars(patch.estimated_cost) : undefined,
          quoted_cost: patch.quoted_cost !== undefined ? toDollars(patch.quoted_cost) : undefined,
          deposit_paid:
            patch.deposit_paid !== undefined ? toDollars(patch.deposit_paid) : undefined,
          balance_due_date: patch.balance_due_date,
          notes: patch.notes,
        });

        handleUpsertLocal(saved);
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Could not save changes",
          description: e instanceof Error ? e.message : "Try again.",
        });
      }
    });
  };

  const motionUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" as const },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
            Budget Tracker
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="sr-only"
            onChange={onImportFile}
            aria-label="Import budget CSV or Excel file"
          />
          <Button type="button" variant="ghost" onClick={openImportPicker} className="gap-2">
            <Upload className="size-4" aria-hidden />
            Import
          </Button>
          <Button type="button" variant="ghost" onClick={exportCsv} className="gap-2">
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
        </div>
      </div>

      <motion.div {...motionUp} transition={{ ...motionUp.transition, delay: 0 }}>
        <div className="grid w-full grid-cols-3 items-center rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-sm)]">
          <div className="px-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Total Budget
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">
              {formatUsdFromCents(totalBudget)}
            </p>
          </div>
          <div className="border-x border-[var(--color-border)] px-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Committed
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">
              {formatUsdFromCents(totals.committed)}
            </p>
          </div>
          <div className="px-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Remaining
            </p>
            <p
              className="mt-1 text-2xl font-semibold tabular-nums"
              style={{
                color:
                  totals.remaining < 0
                    ? "var(--color-danger)"
                    : totals.remaining > 0
                      ? "var(--color-success)"
                      : "var(--color-text-primary)",
              }}
            >
              {formatUsdFromCents(totals.remaining)}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="h-px w-full bg-[var(--color-border)]" />

      <motion.div
        {...motionUp}
        transition={{ ...motionUp.transition, delay: 0.04 }}
        className="grid gap-6 lg:grid-cols-[55%_45%]"
      >
        <BudgetDonutChart items={items} totalBudget={totalBudget} />
        <PaymentSchedule items={items} />
      </motion.div>

      <motion.div {...motionUp} transition={{ ...motionUp.transition, delay: 0.08 }}>
        <BudgetTable
          items={items}
          totalBudget={totalBudget}
          editingId={editingId}
          onEditingChange={setEditingId}
          onUpdate={handleUpdate}
          onEditRow={openEdit}
          onAdd={openAdd}
        />
      </motion.div>

      <AddBudgetItemModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        coupleId={coupleId}
        item={modalItem}
        weddingDate={weddingDate}
        onUpsert={handleUpsertLocal}
      />
    </div>
  );
}

