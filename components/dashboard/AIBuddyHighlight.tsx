"use client";

import { Button } from "@/components/ui/button";
import { useBuddyStore } from "@/store/buddyStore";
import { cn } from "@/lib/utils";
import type { WeddingProfile } from "@/types/index";
import { daysUntilWedding } from "@/lib/dashboard/dashboard-data";

export type DashboardChecklistSummary = {
  overdueCount: number;
  firstIncompleteInCurrentPhase: { title: string } | null;
  budgetCommittedOverEstimate: boolean;
};

export type DashboardVendorSummary = {
  hasPhotographerBooked: boolean;
  hasVenueBooked: boolean;
};

type AIBuddyHighlightProps = {
  weddingProfile: WeddingProfile;
  checklistSummary: DashboardChecklistSummary;
  vendorSummary: DashboardVendorSummary;
};

function buildNudge(
  profile: WeddingProfile,
  checklistSummary: DashboardChecklistSummary,
  vendorSummary: DashboardVendorSummary,
): string {
  const days = daysUntilWedding(profile.wedding_date);

  if (
    days !== null &&
    days <= 365 &&
    !vendorSummary.hasPhotographerBooked
  ) {
    return "Photography books up fast for popular dates. If you haven’t locked a photographer yet, this is a great week to shortlist and reach out.";
  }

  if (days !== null && days <= 270 && !vendorSummary.hasVenueBooked) {
    return "Your venue anchors almost every other decision. When you’re ready, we can narrow options by guest count, season, and budget.";
  }

  if (checklistSummary.overdueCount >= 3) {
    return `You have ${checklistSummary.overdueCount} overdue tasks. Want help deciding what to tackle first so nothing slips?`;
  }

  if (checklistSummary.budgetCommittedOverEstimate) {
    return "At least one budget category has more committed than you estimated. We can rebalance or find places to trim before you sign more contracts.";
  }

  const next = checklistSummary.firstIncompleteInCurrentPhase;
  if (next?.title) {
    return `Your next focus: ${next.title}. Open chat anytime to break it into smaller steps or adjust timing.`;
  }

  return "You’re in a good rhythm. Ask me about timelines, budget tradeoffs, or what to prioritize next.";
}

export function AIBuddyHighlight({
  weddingProfile,
  checklistSummary,
  vendorSummary,
}: AIBuddyHighlightProps) {
  const setBuddyOpen = useBuddyStore((s) => s.setBuddyOpen);
  const text = buildNudge(weddingProfile, checklistSummary, vendorSummary);

  return (
    <div
      className={cn(
        "rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
        FROM YOUR PLANNER
      </p>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--color-text-primary)]">{text}</p>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setBuddyOpen(true)}
        className="mt-5 h-auto px-0 text-sm font-semibold text-[var(--color-accent)] hover:bg-transparent hover:text-[var(--color-accent-hover)]"
      >
        Chat with Aisle →
      </Button>
    </div>
  );
}
