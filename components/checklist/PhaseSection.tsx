"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CHECKLIST_PHASE_CONFIG } from "@/lib/constants";
import type { ChecklistPhase } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ChecklistItem as ChecklistItemType } from "@/types/index";
import { ChecklistItem } from "@/components/checklist/ChecklistItem";

function phaseLabel(id: ChecklistPhase): string {
  const row = CHECKLIST_PHASE_CONFIG.find((p) => p.id === id);
  return row?.label ?? id;
}

type PhaseSectionProps = {
  phase: ChecklistPhase;
  items: ChecklistItemType[];
  allPhaseItems: ChecklistItemType[];
  isExpanded: boolean;
  isCurrent: boolean;
  onToggle: () => void;
  onComplete: (id: string, completed: boolean) => void;
  onSnooze: (id: string, until: Date) => void;
  onRequestCustomSnooze: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: ChecklistItemType) => void;
};

export function PhaseSection({
  phase,
  items,
  allPhaseItems,
  isExpanded,
  isCurrent,
  onToggle,
  onComplete,
  onSnooze,
  onRequestCustomSnooze,
  onDelete,
  onEdit,
}: PhaseSectionProps) {
  if (items.length === 0) return null;

  const completedFiltered = items.filter((i) => i.completed).length;
  const totalFiltered = items.length;
  const pct = totalFiltered > 0 ? (completedFiltered / totalFiltered) * 100 : 0;
  const phaseFullyComplete =
    allPhaseItems.length > 0 && allPhaseItems.every((i) => i.completed);

  return (
    <section className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-sm)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--color-bg-subtle)]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-semibold text-[var(--color-text-primary)]">{phaseLabel(phase)}</span>
            {isCurrent ? (
              <span className="rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent-foreground)]">
                Current Phase
              </span>
            ) : null}
            {phaseFullyComplete ? (
              <span className="rounded-full bg-[var(--color-status-success)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--color-status-success)]">
                ✓ Complete
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm text-[var(--color-text-muted)]">
            {completedFiltered}/{totalFiltered}
          </span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <ChevronDown
            className={cn("size-5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200", isExpanded && "rotate-180")}
            aria-hidden
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ul className="border-t border-[var(--color-border)] px-5 pb-4 pt-1">
              {items.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  onComplete={onComplete}
                  onSnooze={onSnooze}
                  onRequestCustomSnooze={onRequestCustomSnooze}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
