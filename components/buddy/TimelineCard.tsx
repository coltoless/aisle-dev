"use client";

import { useToast } from "@/hooks/use-toast";
import { parseTimelineRows, type TimelineRowParsed } from "@/lib/buddy/detect";

type TimelineCardProps = {
  content: string;
};

function parseMinutes(t: string): number | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

function gapTight(prev: TimelineRowParsed, cur: TimelineRowParsed): boolean {
  const a = parseMinutes(prev.time);
  const b = parseMinutes(cur.time);
  if (a == null || b == null) return false;
  const d = b - a;
  return d >= 0 && d < 15;
}

export function TimelineCard({ content }: TimelineCardProps) {
  const { toast } = useToast();
  const rows = parseTimelineRows(content);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: "Copied for vendors" });
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  };

  const printPdf = () => {
    window.print();
  };

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)]">Timeline parsing failed — showing raw text.</p>;
  }

  return (
    <div className="buddy-timeline-print space-y-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-[var(--shadow-sm)]">
      <div className="space-y-0">
        {rows.map((row, i) => {
          const prev = i > 0 ? rows[i - 1] : null;
          const tight = prev ? gapTight(prev, row) : false;
          return (
            <div key={`${row.time}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
              <div className="flex w-[88px] shrink-0 flex-col items-end pt-0.5">
                <span className="font-mono text-[13px] font-bold text-[var(--color-accent)]">{row.time}</span>
                {tight ? (
                  <span
                    className="mt-1 text-[10px] font-medium text-amber-700"
                    title="Less than 15 minutes after previous item"
                  >
                    Tight
                  </span>
                ) : null}
              </div>
              <div className="relative w-px shrink-0 bg-[var(--color-border)] last:hidden">
                <span className="absolute left-1/2 top-2 size-2 -translate-x-1/2 rounded-full bg-[var(--color-accent)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{row.title}</p>
                {row.note ? (
                  <p className="mt-0.5 text-[12px] text-[var(--color-text-muted)]">{row.note}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-3">
        <button
          type="button"
          onClick={printPdf}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-subtle)]"
        >
          Export as PDF
        </button>
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]"
        >
          Copy for Vendors
        </button>
      </div>
    </div>
  );
}
