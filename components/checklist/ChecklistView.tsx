"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { CHECKLIST_PHASE_CONFIG, type ChecklistPhase } from "@/lib/constants";
import { applyChecklistFilter, type ChecklistFilter } from "@/lib/checklist/filters";
import { todayIsoLocal } from "@/lib/checklist/dates";
import { completeTask, deleteTask, snoozeTask } from "@/lib/actions/checklist";
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
import { cn } from "@/lib/utils";
import type { ChecklistItem as ChecklistItemType } from "@/types/index";
import { PhaseSection } from "@/components/checklist/PhaseSection";
import { AddTaskModal } from "@/components/checklist/AddTaskModal";
import { EditTaskModal } from "@/components/checklist/EditTaskModal";

const PHASE_RENDER_ORDER = [...CHECKLIST_PHASE_CONFIG]
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((p) => p.id) as ChecklistPhase[];

function sortChecklistItems(list: ChecklistItemType[]): ChecklistItemType[] {
  const phaseIndex = (p: ChecklistItemType["phase"]) => {
    if (!p) return 999;
    const i = PHASE_RENDER_ORDER.indexOf(p);
    return i === -1 ? 999 : i;
  };
  return [...list].sort((a, b) => {
    const pa = phaseIndex(a.phase);
    const pb = phaseIndex(b.phase);
    if (pa !== pb) return pa - pb;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.created_at.localeCompare(b.created_at);
  });
}

function ChecklistConfetti() {
  return (
    <svg className="h-24 w-full text-[var(--color-accent)]/40" viewBox="0 0 400 80" fill="none" aria-hidden>
      <rect x="20" y="10" width="8" height="14" rx="2" fill="currentColor" transform="rotate(12 24 17)" />
      <rect x="60" y="40" width="10" height="10" rx="2" fill="currentColor" transform="-rotate(8 65 45)" />
      <rect x="120" y="8" width="7" height="18" rx="2" fill="currentColor" transform="rotate(25 123 17)" />
      <rect x="180" y="35" width="12" height="8" rx="2" fill="currentColor" />
      <rect x="240" y="12" width="9" height="12" rx="2" fill="currentColor" transform="-rotate(18 244 18)" />
      <rect x="300" y="44" width="11" height="9" rx="2" fill="currentColor" transform="rotate(6 305 48)" />
      <rect x="350" y="18" width="8" height="16" rx="2" fill="currentColor" transform="rotate(-22 354 26)" />
    </svg>
  );
}

export type ChecklistViewProps = {
  items: ChecklistItemType[];
  currentPhase: ChecklistPhase | null;
  weddingDate: string | null;
};

const FILTER_LABELS: { id: ChecklistFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "incomplete", label: "Incomplete" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

export function ChecklistView({ items: initialItems, currentPhase, weddingDate }: ChecklistViewProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItemType[]>(initialItems);
  const [expandedPhases, setExpandedPhases] = useState<Set<ChecklistPhase>>(() => new Set());
  const expandInit = useRef(false);
  const [filter, setFilter] = useState<ChecklistFilter>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ChecklistItemType | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [customSnoozeId, setCustomSnoozeId] = useState<string | null>(null);
  const [customSnoozeDate, setCustomSnoozeDate] = useState("");

  const today = useMemo(() => todayIsoLocal(), []);
  void weddingDate;

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (expandInit.current) return;
    expandInit.current = true;
    const expand =
      currentPhase ?? PHASE_RENDER_ORDER.find((ph) => initialItems.some((i) => i.phase === ph)) ?? null;
    if (expand) setExpandedPhases(new Set([expand]));
  }, [currentPhase, initialItems]);

  const sortedItems = useMemo(() => sortChecklistItems(items), [items]);
  const visibleItems = useMemo(() => applyChecklistFilter(sortedItems, filter, today), [sortedItems, filter, today]);

  const total = sortedItems.length;
  const completed = useMemo(() => sortedItems.filter((i) => i.completed).length, [sortedItems]);
  const trueProgressPct = total > 0 ? (completed / total) * 100 : 0;

  useEffect(() => {
    setProgressWidth(0);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setProgressWidth(trueProgressPct));
    });
    return () => cancelAnimationFrame(id);
  }, [trueProgressPct]);

  const allDone = total > 0 && completed === total;
  const filterEmpty = total > 0 && visibleItems.length === 0;

  const togglePhase = useCallback((phase: ChecklistPhase) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  }, []);

  const handleComplete = useCallback(
    async (id: string, completed: boolean) => {
      let snapshot: ChecklistItemType[] = [];
      const now = new Date().toISOString();
      setItems((list) => {
        snapshot = list;
        return list.map((i) => (i.id === id ? { ...i, completed, completed_at: completed ? now : null } : i));
      });
      try {
        const updated = await completeTask(id, completed);
        setItems((list) => list.map((i) => (i.id === id ? updated : i)));
      } catch (e) {
        setItems(snapshot);
        toast({
          variant: "destructive",
          title: "Could not update task",
          description: e instanceof Error ? e.message : "Try again.",
        });
      }
    },
    [toast],
  );

  const handleRequestCustomSnooze = useCallback((id: string) => {
    setCustomSnoozeId(id);
    setCustomSnoozeDate("");
  }, []);

  const handleSnooze = useCallback(
    async (id: string, until: Date) => {
      let snapshot: ChecklistItemType[] = [];
      const y = until.getFullYear();
      const m = String(until.getMonth() + 1).padStart(2, "0");
      const d = String(until.getDate()).padStart(2, "0");
      const iso = `${y}-${m}-${d}`;
      setItems((list) => {
        snapshot = list;
        return list.map((i) => (i.id === id ? { ...i, snoozed_until: iso } : i));
      });
      try {
        const updated = await snoozeTask(id, until);
        setItems((list) => list.map((i) => (i.id === id ? updated : i)));
      } catch (e) {
        setItems(snapshot);
        toast({
          variant: "destructive",
          title: "Could not snooze task",
          description: e instanceof Error ? e.message : "Try again.",
        });
      }
    },
    [toast],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      let snapshot: ChecklistItemType[] = [];
      setItems((list) => {
        snapshot = list;
        return list.filter((i) => i.id !== id);
      });
      try {
        await deleteTask(id);
      } catch (e) {
        setItems(snapshot);
        toast({
          variant: "destructive",
          title: "Could not delete task",
          description: e instanceof Error ? e.message : "Try again.",
        });
      }
    },
    [toast],
  );

  const handleEdit = useCallback((item: ChecklistItemType) => {
    setEditItem(item);
    setEditOpen(true);
  }, []);

  const handleAdded = useCallback((row: ChecklistItemType) => {
    setItems((list) => [...list, row]);
  }, []);

  const handleUpdated = useCallback((row: ChecklistItemType) => {
    setItems((list) => list.map((i) => (i.id === row.id ? row : i)));
  }, []);

  const submitCustomSnooze = useCallback(() => {
    if (!customSnoozeId || !customSnoozeDate) return;
    const [y, m, d] = customSnoozeDate.split("-").map(Number);
    if (!y || !m || !d) return;
    const id = customSnoozeId;
    const until = new Date(y, m - 1, d);
    setCustomSnoozeId(null);
    setCustomSnoozeDate("");
    void handleSnooze(id, until);
  }, [customSnoozeDate, customSnoozeId, handleSnooze]);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Planning Checklist
          </h1>
          <p className="shrink-0 font-sans text-sm text-[var(--color-text-muted)]">
            {completed}/{total} tasks complete
          </p>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <motion.div
            className="h-full rounded-full bg-[var(--color-accent)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_LABELS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filter === id
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                  : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex justify-end sm:ml-auto">
          <Button type="button" variant="ghost" className="gap-2 text-[var(--color-accent)]" onClick={() => setAddOpen(true)}>
            <PlusCircle className="size-4" aria-hidden />
            Add Task
          </Button>
        </div>
      </div>

      {allDone ? (
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-10 text-center shadow-[var(--shadow-sm)]">
          <ChecklistConfetti />
          <p className="mt-4 font-display text-2xl font-semibold text-[var(--color-text-primary)]">
            Every task is done. Go enjoy your wedding.
          </p>
        </div>
      ) : null}

      {total === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-6 py-14 text-center shadow-[var(--shadow-sm)]">
          <p className="font-display text-lg font-semibold text-[var(--color-text-primary)]">No tasks yet</p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Add a task to start planning, or use onboarding to seed your list.</p>
          <Button
            type="button"
            className="mt-6 gap-2 bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
            onClick={() => setAddOpen(true)}
          >
            <PlusCircle className="size-4" aria-hidden />
            Add your first task
          </Button>
        </div>
      ) : filterEmpty ? (
        <div className="rounded-[12px] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">No tasks match this filter.</p>
          <button type="button" className="mt-3 text-sm font-medium text-[var(--color-accent)] hover:underline" onClick={() => setFilter("all")}>
            Clear filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {PHASE_RENDER_ORDER.map((phase) => {
            const phaseVisible = visibleItems.filter((i) => i.phase === phase);
            const allInPhase = sortedItems.filter((i) => i.phase === phase);
            if (phaseVisible.length === 0) return null;
            return (
              <PhaseSection
                key={phase}
                phase={phase}
                items={phaseVisible}
                allPhaseItems={allInPhase}
                isExpanded={expandedPhases.has(phase)}
                isCurrent={currentPhase === phase}
                onToggle={() => togglePhase(phase)}
                onComplete={handleComplete}
                onSnooze={handleSnooze}
                onRequestCustomSnooze={handleRequestCustomSnooze}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            );
          })}
        </div>
      )}

      <AddTaskModal currentPhase={currentPhase} open={addOpen} onOpenChange={setAddOpen} onAdded={handleAdded} />
      <EditTaskModal
        item={editItem}
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditItem(null);
        }}
        onUpdated={handleUpdated}
      />

      <Dialog
        open={!!customSnoozeId}
        onOpenChange={(o) => {
          if (!o) {
            setCustomSnoozeId(null);
            setCustomSnoozeDate("");
          }
        }}
      >
        <DialogContent className="border-[var(--color-border)] bg-[var(--color-bg-card)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Snooze until</DialogTitle>
          </DialogHeader>
          <Input
            type="date"
            value={customSnoozeDate}
            onChange={(e) => setCustomSnoozeDate(e.target.value)}
            className="border-[var(--color-border)]"
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setCustomSnoozeId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
              onClick={submitCustomSnooze}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
