"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarX, Info, MoreHorizontal } from "lucide-react";
import { useCallback, useState } from "react";
import { CHECKLIST_CATEGORIES } from "@/lib/constants";
import { daysFromToday, isSnoozeActive, parseLocalDate, todayIsoLocal } from "@/lib/checklist/dates";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ChecklistItem as ChecklistItemType } from "@/types/index";

function categoryLabel(category: string | null): string {
  if (!category) return "Task";
  const row = CHECKLIST_CATEGORIES.find((c) => c.id === category);
  return row?.label ?? category.replace(/_/g, " ");
}

function formatShortDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type ChecklistItemProps = {
  item: ChecklistItemType;
  onComplete: (id: string, completed: boolean) => void;
  onSnooze: (id: string, until: Date) => void;
  onRequestCustomSnooze: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: ChecklistItemType) => void;
};

function addDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

export function ChecklistItem({ item, onComplete, onSnooze, onRequestCustomSnooze, onDelete, onEdit }: ChecklistItemProps) {
  const today = todayIsoLocal();
  const [notesOpen, setNotesOpen] = useState(false);

  const due = item.due_date;
  const overdue = due ? due < today && !item.completed : false;
  const delta = due ? daysFromToday(due, today) : null;
  const withinWeek = due && !overdue && delta !== null && delta >= 0 && delta <= 7;
  const snoozed = isSnoozeActive(item.snoozed_until, today);

  const handleSnoozePreset = useCallback(
    (days: number) => {
      onSnooze(item.id, addDays(new Date(), days));
    },
    [item.id, onSnooze],
  );

  const dueNode = !due ? null : overdue ? (
    <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--color-status-warning)]">
      <CalendarX className="size-4 shrink-0" aria-hidden />
      Overdue
    </span>
  ) : withinWeek ? (
    <span className="shrink-0 text-sm font-medium text-[var(--color-status-warning)]">Due {formatShortDate(due)}</span>
  ) : (
    <span className="shrink-0 text-sm text-[var(--color-text-muted)]">{formatShortDate(due)}</span>
  );

  return (
    <li className="group flex items-center gap-3 border-b border-[var(--color-border)] py-3 last:border-b-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.completed}
        onClick={() => onComplete(item.id, !item.completed)}
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
          item.completed
            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
            : "border-[var(--color-border-strong)] bg-white hover:bg-[var(--color-accent-muted)]",
        )}
      >
        {item.completed ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <motion.span
            animate={{
              opacity: item.completed ? 0.65 : 1,
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "font-sans text-[15px] font-medium text-[var(--color-text-primary)]",
              item.completed && "text-[var(--color-text-muted)] line-through decoration-[var(--color-text-muted)]",
            )}
          >
            {item.title}
          </motion.span>
          <span className="rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 text-xs font-medium capitalize text-[var(--color-text-secondary)]">
            {categoryLabel(item.category)}
          </span>
          {item.notes?.trim() ? (
            <button
              type="button"
              aria-expanded={notesOpen}
              onClick={() => setNotesOpen((v) => !v)}
              className="inline-flex size-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]"
            >
              <Info className="size-4" aria-hidden />
              <span className="sr-only">Toggle notes</span>
            </button>
          ) : null}
        </div>
        <AnimatePresence initial={false}>
          {notesOpen && item.notes?.trim() ? (
            <motion.div
              key="notes"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.notes}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {dueNode}
        {snoozed ? (
          <span className="rounded-full bg-[var(--color-status-info)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-status-info)]">
            Snoozed
          </span>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
              aria-label="Task options"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => onEdit(item)}>Edit</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Snooze</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => handleSnoozePreset(7)}>1 week</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSnoozePreset(14)}>2 weeks</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSnoozePreset(30)}>1 month</DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    onRequestCustomSnooze(item.id);
                  }}
                >
                  Custom date…
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[var(--color-danger)] focus:text-[var(--color-danger)]"
              onSelect={() => {
                if (typeof window !== "undefined" && window.confirm("Delete this task?")) {
                  onDelete(item.id);
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </li>
  );
}
