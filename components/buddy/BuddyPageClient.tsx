"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { BuddyChatPanel } from "@/components/buddy/BuddyChatPanel";
import type { BuddyMessage } from "@/types/api";
import { useBuddyStore } from "@/store/buddyStore";
import { cn } from "@/lib/utils";

function groupSessions(messages: BuddyMessage[]): BuddyMessage[][] {
  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const groups: BuddyMessage[][] = [];
  let cur: BuddyMessage[] = [];
  for (const m of sorted) {
    if (cur.length === 0) {
      cur.push(m);
      continue;
    }
    const prev = cur[cur.length - 1]!;
    const gap = new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime();
    if (gap > 24 * 60 * 60 * 1000) {
      groups.push(cur);
      cur = [m];
    } else {
      cur.push(m);
    }
  }
  if (cur.length) groups.push(cur);
  return groups.reverse();
}

type BuddyPageClientProps = {
  coupleId: string;
};

export function BuddyPageClient({ coupleId }: BuddyPageClientProps) {
  const messages = useBuddyStore((s) => s.messages);
  const [focusKey, setFocusKey] = useState<string | null>(null);

  const sessions = useMemo(() => groupSessions(messages), [messages]);

  const sessionLabel = useCallback((g: BuddyMessage[]) => {
    const t = new Date(g[0]!.createdAt);
    return t.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }, []);

  const focusMessages = useMemo(() => {
    if (!focusKey) return null;
    const g = sessions.find((s) => sessionKey(s) === focusKey);
    return g ?? null;
  }, [focusKey, sessions]);

  return (
    <div className="flex min-h-[calc(100vh-120px)] gap-6">
      <aside className="hidden w-[260px] shrink-0 flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 shadow-[var(--shadow-sm)] md:flex">
        <Link
          href="/dashboard"
          className="mb-3 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
        >
          ← Back to dashboard
        </Link>
        <button
          type="button"
          onClick={() => setFocusKey(null)}
          className="mb-3 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-center text-sm font-medium text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]"
        >
          New Conversation
        </button>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
          History
        </p>
        <ul className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto text-sm">
          {sessions.map((g) => {
            const k = sessionKey(g);
            const active = focusKey === k;
            return (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => setFocusKey(k)}
                  className={cn(
                    "w-full rounded-md px-2 py-2 text-left transition-colors",
                    active
                      ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]",
                  )}
                >
                  <span className="block font-medium">{sessionLabel(g)}</span>
                  <span className="line-clamp-2 text-xs text-[var(--color-text-muted)]">
                    {g[g.length - 1]?.content.slice(0, 80)}
                    {(g[g.length - 1]?.content.length ?? 0) > 80 ? "…" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-1 justify-center">
        <div className="flex w-full max-w-[720px] flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <h1 className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
              Planning Buddy
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Same chat as the drawer — pick up where you left off.
            </p>
          </div>
          <BuddyChatPanel
            coupleId={coupleId}
            showWindowChrome={false}
            visibleMessageIds={focusMessages?.map((m) => m.id) ?? null}
            className="min-h-[560px]"
          />
          {focusMessages ? (
            <p className="border-t border-[var(--color-border)] px-4 py-2 text-center text-[11px] text-[var(--color-text-muted)]">
              Showing messages from {sessionLabel(focusMessages)}.{" "}
              <button
                type="button"
                className="font-medium text-[var(--color-accent)] underline"
                onClick={() => setFocusKey(null)}
              >
                Show all
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function sessionKey(g: BuddyMessage[]): string {
  return `${g[0]!.id}:${g[g.length - 1]!.id}`;
}
