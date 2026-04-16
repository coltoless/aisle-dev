"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addBudgetItem, updateBudgetItem, type AddBudgetItemData } from "@/lib/actions/budget";
import type { BudgetItem } from "@/types/index";

type AddBudgetItemModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupleId: string;
  item: BudgetItem | null;
  weddingDate: string | null;
  onUpsert: (row: BudgetItem) => void;
};

function parseNumberOrNull(v: string): number | null {
  const raw = v.trim();
  if (!raw) return null;
  const num = Number(raw.replaceAll(/[^0-9.-]/g, ""));
  if (!Number.isFinite(num)) return null;
  return num;
}

export function AddBudgetItemModal({
  open,
  onOpenChange,
  coupleId,
  item,
  weddingDate,
  onUpsert,
}: AddBudgetItemModalProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [categoryLabel, setCategoryLabel] = useState("");
  const [estimated, setEstimated] = useState("");
  const [quoted, setQuoted] = useState("");
  const [deposit, setDeposit] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState(false);

  const title = item ? "Edit category" : "Add category";

  useEffect(() => {
    if (!open) return;
    setCategoryLabel(item?.category_label ?? "");
    setEstimated(item?.estimated_cost != null ? String(item.estimated_cost / 100).replace(/\.0$/, "") : "");
    setQuoted(item?.quoted_cost != null ? String(item.quoted_cost / 100).replace(/\.0$/, "") : "");
    setDeposit(item?.deposit_paid != null ? String(item.deposit_paid / 100).replace(/\.0$/, "") : "");
    setDueDate(item?.balance_due_date ?? "");
    setNotes(item?.notes ?? "");
    setNameError(false);
  }, [open, item]);

  const subtitle = useMemo(() => {
    void weddingDate;
    return null;
  }, [weddingDate]);

  const submit = () => {
    if (!categoryLabel.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    startTransition(async () => {
      try {
        if (item) {
          const updated = await updateBudgetItem(item.id, {
            category_label: categoryLabel.trim(),
            estimated_cost: parseNumberOrNull(estimated),
            quoted_cost: parseNumberOrNull(quoted),
            deposit_paid: parseNumberOrNull(deposit),
            balance_due_date: dueDate.trim() || null,
            notes: notes.trim() || null,
          });
          onUpsert(updated);
          toast({ title: "Category updated" });
          onOpenChange(false);
        } else {
          const payload: AddBudgetItemData = {
            category_label: categoryLabel.trim(),
            estimated_cost: parseNumberOrNull(estimated),
            quoted_cost: parseNumberOrNull(quoted),
            deposit_paid: parseNumberOrNull(deposit),
            balance_due_date: dueDate.trim() || null,
            notes: notes.trim() || null,
          };
          const inserted = await addBudgetItem(coupleId, payload);
          onUpsert(inserted);
          toast({ title: "Category added" });
          onOpenChange(false);
        }
      } catch (e) {
        toast({
          variant: "destructive",
          title: item ? "Could not update category" : "Could not add category",
          description: e instanceof Error ? e.message : "Try again.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--color-border)] bg-[var(--color-bg-card)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
          {subtitle}
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              Category name <span className="text-[var(--color-danger)]">*</span>
            </label>
            <Input
              value={categoryLabel}
              onChange={(e) => {
                setCategoryLabel(e.target.value);
                if (nameError && e.target.value.trim()) setNameError(false);
              }}
              className={nameError ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"}
              placeholder="e.g. Venue, Catering & Bar"
            />
            {nameError ? <p className="text-sm text-[var(--color-danger)]">Category name is required.</p> : null}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">Estimated</label>
              <Input inputMode="decimal" value={estimated} onChange={(e) => setEstimated(e.target.value)} placeholder="15000" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">Quoted</label>
              <Input inputMode="decimal" value={quoted} onChange={(e) => setQuoted(e.target.value)} placeholder="14500" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">Deposit paid</label>
              <Input inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="5000" />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">Balance due date</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
              placeholder="Optional details…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending}
            className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
            onClick={submit}
          >
            {pending ? "Saving…" : item ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

