"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AIBuddyHighlight, type DashboardChecklistSummary, type DashboardVendorSummary } from "@/components/dashboard/AIBuddyHighlight";
import { BudgetSnapshot } from "@/components/dashboard/BudgetSnapshot";
import { DashboardHomeHeader } from "@/components/dashboard/dashboard-home-header";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import type { BudgetItemRow } from "@/lib/dashboard/dashboard-data";
import { formatUsdAbbreviated } from "@/lib/dashboard/format-money";
import { BUDGET_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ChecklistItem, WeddingProfile } from "@/types/index";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.03 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

function vendorCategoryLabel(category: string): string {
  const row = BUDGET_CATEGORIES.find((c) => c.id === category);
  return row?.label ?? category.replace(/_/g, " ");
}

export type DashboardHomeViewProps = {
  partner1: string;
  partner2: string;
  subline: string;
  checklistItems: ChecklistItem[];
  budgetItems: BudgetItemRow[];
  weddingProfile: WeddingProfile;
  checklistSummary: DashboardChecklistSummary;
  vendorSummary: DashboardVendorSummary;
  checklistStat: { completed: number; total: number; overdue: number };
  budgetStat: {
    committedCents: number;
    totalCents: number | null;
    remainingCents: number;
    progressPct: number;
    overBudget: boolean;
    overNinetyPct: boolean;
  };
  vendorStat: { booked: number; total: number; bookedCategoryIds: string[] };
};

export function DashboardHomeView({
  partner1,
  partner2,
  subline,
  checklistItems,
  budgetItems,
  weddingProfile,
  checklistSummary,
  vendorSummary,
  checklistStat,
  budgetStat,
  vendorStat,
}: DashboardHomeViewProps) {
  const [checklistRows, setChecklistRows] = useState(checklistItems);

  useEffect(() => {
    setChecklistRows(checklistItems);
  }, [checklistItems]);

  const checklistProgress =
    checklistStat.total > 0 ? (checklistStat.completed / checklistStat.total) * 100 : 0;

  const budgetBarColor = budgetStat.overBudget
    ? "var(--color-danger)"
    : budgetStat.overNinetyPct
      ? "var(--color-warning)"
      : "var(--color-accent)";

  const budgetDisplayPct = Math.min(100, budgetStat.progressPct);

  const badgeIds = vendorStat.bookedCategoryIds.slice(0, 4);
  const badgeOverflow = Math.max(0, vendorStat.bookedCategoryIds.length - 4);

  const vendorFooter =
    vendorStat.bookedCategoryIds.length > 0 ? (
      <div className="flex flex-wrap gap-1.5">
        {badgeIds.map((id) => (
          <span
            key={id}
            className="rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]"
          >
            {vendorCategoryLabel(id)}
          </span>
        ))}
        {badgeOverflow > 0 ? (
          <span className="rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-muted)]">
            +{badgeOverflow} more
          </span>
        ) : null}
      </div>
    ) : null;

  return (
    <div>
      <DashboardHomeHeader partner1={partner1} partner2={partner2} subline={subline} />

      <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            title="Checklist"
            value={`${checklistStat.completed}/${checklistStat.total} tasks`}
            subtext={
              checklistStat.total === 0 ? (
                <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Loader2 className="size-4 animate-spin text-[var(--color-accent)]" aria-hidden />
                  Your checklist is being prepared...
                </span>
              ) : checklistStat.overdue > 0 ? (
                <span className="text-[var(--color-status-warning)]">{checklistStat.overdue} overdue</span>
              ) : (
                <span className="text-[var(--color-text-muted)]">On track</span>
              )
            }
            progress={checklistStat.total > 0 ? checklistProgress : undefined}
          />
          <StatCard
            title="Budget"
            value={`${formatUsdAbbreviated(budgetStat.committedCents)} committed`}
            subtext={
              budgetStat.totalCents != null ? (
                <span className="text-[var(--color-text-muted)]">
                  {formatUsdAbbreviated(budgetStat.remainingCents)} remaining of{" "}
                  {formatUsdAbbreviated(budgetStat.totalCents)}
                </span>
              ) : (
                <span className="text-[var(--color-text-muted)]">Set a total in settings to track remaining.</span>
              )
            }
            progress={
              budgetStat.totalCents != null && budgetStat.totalCents > 0 ? budgetDisplayPct : undefined
            }
            accentColor={budgetBarColor}
          />
          <StatCard
            title="Vendors"
            value={`${vendorStat.booked} booked`}
            subtext={
              vendorStat.total === 0 ? (
                <span className="text-[var(--color-text-muted)]">
                  No vendors added yet.{" "}
                  <Link href="/venues" className="font-medium text-[var(--color-accent)] hover:underline">
                    Start by browsing venues →
                  </Link>
                </span>
              ) : (
                <span className="text-[var(--color-text-muted)]">
                  {vendorStat.total} total · {Math.max(0, vendorStat.total - vendorStat.booked)} still needed
                </span>
              )
            }
            footer={vendorStat.total > 0 ? vendorFooter : undefined}
          />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <UpcomingTasks items={checklistRows} />
          </div>
          <div className="lg:col-span-2">
            {budgetItems.length === 0 ? (
              <div
                className={cn(
                  "rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]",
                )}
              >
                <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">
                  Budget snapshot
                </h2>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  <Loader2 className="size-8 animate-spin text-[var(--color-accent)]" aria-hidden />
                  <p>Your budget is being prepared...</p>
                </div>
              </div>
            ) : (
              <BudgetSnapshot items={budgetItems} />
            )}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <AIBuddyHighlight
            weddingProfile={weddingProfile}
            checklistSummary={checklistSummary}
            vendorSummary={vendorSummary}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
