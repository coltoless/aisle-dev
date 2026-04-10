"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHECKLIST_CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/types/index";
import { startOfTodayUtcDateString } from "@/lib/dashboard/dashboard-data";

function categoryLabel(category: string | null): string {
  if (!category) return "General";
  const row = CHECKLIST_CATEGORIES.find((c) => c.id === category);
  return row?.label ?? category;
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatTaskDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysFromToday(due: string, today: string): number {
  const a = parseLocalDate(today).getTime();
  const b = parseLocalDate(due).getTime();
  return Math.round((b - a) / 86_400_000);
}

type RowProps = {
  item: ChecklistItem;
  today: string;
  onToggle: (id: string, next: boolean) => void;
};

function TaskRow({ item, today, onToggle }: RowProps) {
  const due = item.due_date;
  const overdue = due ? due < today : false;
  const delta = due ? daysFromToday(due, today) : null;
  const withinWeek = due && !overdue && delta !== null && delta >= 0 && delta <= 7;

  const dateNode = !due ? (
    <span className="text-right text-sm text-[var(--color-text-muted)]">No date</span>
  ) : overdue ? (
    <span className="text-right text-sm font-medium text-[var(--color-status-warning)]">
      Overdue
      <span className="mt-0.5 block text-xs font-normal text-[var(--color-text-muted)]">
        {formatTaskDate(due)}
      </span>
    </span>
  ) : withinWeek ? (
    <span className="text-right text-sm font-medium text-[var(--color-status-warning)]">
      Due {formatTaskDate(due)}
    </span>
  ) : (
    <span className="text-right text-sm text-[var(--color-text-muted)]">{formatTaskDate(due)}</span>
  );

  return (
    <motion.li
      layout
      initial={false}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-start gap-3 border-b border-[var(--color-border)] py-3 last:border-b-0"
    >
      <input
        type="checkbox"
        checked={item.completed}
        onChange={(e) => onToggle(item.id, e.target.checked)}
        className="mt-1 size-4 shrink-0 rounded border-[var(--color-border)] text-accent focus:ring-accent"
        aria-label={`Mark complete: ${item.title}`}
      />
      <div className="min-w-0 flex-1">
        <motion.div
          animate={{
            opacity: item.completed ? 0.55 : 1,
          }}
          transition={{ duration: 0.25 }}
          className="flex flex-wrap items-center gap-2"
        >
          <span
            className={cn(
              "font-sans text-[15px] font-medium text-[var(--color-text-primary)]",
              item.completed && "line-through decoration-[var(--color-text-muted)]",
            )}
          >
            {item.title}
          </span>
          <span className="rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]">
            {categoryLabel(item.category)}
          </span>
        </motion.div>
      </div>
      <div className="shrink-0 pt-0.5">{dateNode}</div>
    </motion.li>
  );
}

export type UpcomingTasksProps = {
  items: ChecklistItem[];
};

export function UpcomingTasks({ items }: UpcomingTasksProps) {
  const [rows, setRows] = useState<ChecklistItem[]>(() => items);
  const [pendingExit, setPendingExit] = useState<Set<string>>(() => new Set());
  const exitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const today = useMemo(() => startOfTodayUtcDateString(), []);

  useEffect(() => {
    const timersRef = exitTimers;
    return () => {
      const pending = timersRef.current;
      pending.forEach((t) => clearTimeout(t));
      pending.clear();
    };
  }, []);

  const incomplete = useMemo(() => {
    return rows
      .filter((i) => !i.completed || pendingExit.has(i.id))
      .sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      })
      .slice(0, 5);
  }, [rows, pendingExit]);

  const onToggle = useCallback(async (id: string, completed: boolean) => {
    const now = new Date().toISOString();
    let snapshot: ChecklistItem[] | null = null;

    if (completed) {
      setRows((prev) => {
        snapshot = prev;
        return prev.map((row) =>
          row.id === id ? { ...row, completed: true, completed_at: now } : row,
        );
      });
      setPendingExit((p) => new Set(p).add(id));
      const t = setTimeout(() => {
        setPendingExit((p) => {
          const next = new Set(p);
          next.delete(id);
          return next;
        });
        exitTimers.current.delete(id);
      }, 380);
      exitTimers.current.set(id, t);
    } else {
      setPendingExit((p) => {
        const next = new Set(p);
        next.delete(id);
        return next;
      });
      const existing = exitTimers.current.get(id);
      if (existing) clearTimeout(existing);
      exitTimers.current.delete(id);
      setRows((prev) => {
        snapshot = prev;
        return prev.map((row) =>
          row.id === id ? { ...row, completed: false, completed_at: null } : row,
        );
      });
    }

    const supabase = createClient() as unknown as SupabaseClient<Database>;
    const { error } = await supabase
      .from("checklist_items")
      .update({
        completed,
        completed_at: completed ? now : null,
      })
      .eq("id", id);

    if (error && snapshot) {
      setRows(snapshot);
      setPendingExit((p) => {
        const next = new Set(p);
        next.delete(id);
        return next;
      });
      const existing = exitTimers.current.get(id);
      if (existing) clearTimeout(existing);
      exitTimers.current.delete(id);
    }
  }, []);

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]",
        )}
      >
        <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">Upcoming tasks</h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
          <Loader2 className="size-8 animate-spin text-[var(--color-accent)]" aria-hidden />
          <p>Your checklist is being prepared...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]",
      )}
    >
      <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">Upcoming tasks</h2>

      {incomplete.length === 0 ? (
        <p className="mt-6 py-4 text-center text-sm text-[var(--color-text-secondary)]">
          All caught up! Enjoy the moment.
        </p>
      ) : (
        <ul className="mt-2">
          <AnimatePresence initial={false} mode="popLayout">
            {incomplete.map((item) => (
              <TaskRow key={item.id} item={item} today={today} onToggle={onToggle} />
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Link
        href="/checklist"
        className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
      >
        View all tasks →
      </Link>
    </div>
  );
}
