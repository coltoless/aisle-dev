"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { deleteBudgetFlag } from "@/lib/actions/budget";
import { deleteTask } from "@/lib/actions/checklist";
import type { BuddyToolAction } from "@/types/api";
import { cn } from "@/lib/utils";

type ActionPillProps = {
  action: BuddyToolAction;
  onUndo: () => void;
};

export function ActionPill({ action, onUndo }: ActionPillProps) {
  const success = action.success;

  const handleUndo = async () => {
    try {
      if (action.tool === "add_checklist_item" && action.checklistItemId) {
        await deleteTask(action.checklistItemId);
      } else if (action.tool === "flag_budget_item" && action.budgetFlagId) {
        await deleteBudgetFlag(action.budgetFlagId);
      }
 } catch {
      /* still remove pill */
    }
    onUndo();
  };

  return (
    <div
      className={cn(
        "mt-2 flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-[13px]",
        success ? "bg-[var(--color-accent-muted)]" : "bg-red-50",
      )}
    >
      {success ? (
        <CheckCircle className="mt-0.5 size-4 shrink-0 text-[var(--color-accent)]" aria-hidden />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0 text-[var(--color-danger)]" aria-hidden />
      )}
      <p className="min-w-0 flex-1 leading-snug text-[var(--color-text-primary)]">
        {action.confirmationMessage}
      </p>
      {success && (action.checklistItemId || action.budgetFlagId) ? (
        <button
          type="button"
          onClick={() => void handleUndo()}
          className="shrink-0 text-xs font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          Undo
        </button>
      ) : null}
    </div>
  );
}
