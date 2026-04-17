"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BuddyChatPanel } from "@/components/buddy/BuddyChatPanel";
import { useBuddyStore } from "@/store/buddyStore";

type BuddyDrawerProps = {
  coupleId: string;
};

export function BuddyDrawer({ coupleId }: BuddyDrawerProps) {
  const isOpen = useBuddyStore((s) => s.isOpen);
  const isStreaming = useBuddyStore((s) => s.isStreaming);
  const setBuddyOpen = useBuddyStore((s) => s.setBuddyOpen);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close buddy overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => {
              if (!isStreaming) setBuddyOpen(false);
            }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="AI Planning Buddy"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-[420px] max-w-full flex-col border-l border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-elevated)]"
          >
            <BuddyChatPanel coupleId={coupleId} enableProactiveNudge className="bg-[var(--color-bg-card)]" />
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
