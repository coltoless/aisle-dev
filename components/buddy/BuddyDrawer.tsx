"use client";

import { cn } from "@/lib/utils";

type BuddyDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BuddyDrawer({ open, onOpenChange }: BuddyDrawerProps) {
  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close AI Buddy"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => onOpenChange(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed bottom-0 right-0 top-0 z-50 w-full max-w-md border-l border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-[var(--shadow-elevated)] transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">AI Buddy</h2>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
              onClick={() => onOpenChange(false)}
            >
              Close
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--color-text-muted)]">
            Coming soon
          </div>
        </div>
      </aside>
    </>
  );
}
