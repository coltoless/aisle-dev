"use client";

import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { appendVendorNotes } from "@/lib/actions/vendors";
import { useBuddyStore } from "@/store/buddyStore";
import { cn } from "@/lib/utils";

type EmailDraftCardProps = {
  initialBody: string;
  onBodyChange: (next: string) => void;
};

export function EmailDraftCard({ initialBody, onBodyChange }: EmailDraftCardProps) {
  const { toast } = useToast();
  const selectedVendorId = useBuddyStore((s) => s.selectedVendorId);
  const lines = useMemo(() => initialBody.split("\n"), [initialBody]);
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const [draftLine, setDraftLine] = useState("");

  const setLine = useCallback(
    (idx: number, text: string) => {
      const nextLines = [...lines];
      nextLines[idx] = text;
      onBodyChange(nextLines.join("\n"));
    },
    [lines, onBodyChange],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(initialBody);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  };

  const saveNote = async () => {
    if (!selectedVendorId) {
      toast({
        title: "Select a vendor",
        description: "Choose a vendor from your list (coming from Vendors) to save this draft as a note.",
        variant: "destructive",
      });
      return;
    }
    try {
      await appendVendorNotes(selectedVendorId, initialBody);
      toast({ title: "Saved to vendor notes" });
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 shadow-[var(--shadow-sm)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
        Draft Email
      </p>
      <div className="mt-2 space-y-0.5 font-mono text-[13px] leading-relaxed text-[var(--color-text-primary)]">
        {lines.map((line, idx) => (
          <div key={`${idx}-${line.slice(0, 12)}`}>
            {editingLine === idx ? (
              <textarea
                className="w-full resize-none rounded border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-1"
                rows={2}
                value={draftLine}
                onChange={(e) => setDraftLine(e.target.value)}
                onBlur={() => {
                  setLine(idx, draftLine);
                  setEditingLine(null);
                }}
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingLine(idx);
                  setDraftLine(line);
                }}
                className={cn(
                  "w-full rounded px-1 py-0.5 text-left hover:bg-[var(--color-bg-subtle)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
                )}
              >
                {line || "\u00a0"}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
        >
          Copy to Clipboard
        </button>
        <button
          type="button"
          onClick={() => void saveNote()}
          className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]"
        >
          Save as Note
        </button>
      </div>
    </div>
  );
}
