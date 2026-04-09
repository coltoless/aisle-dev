"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CheckSquare,
  DollarSign,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { BuddyDrawer, useBuddyDrawer } from "@/components/buddy/BuddyDrawer";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/venues", label: "Venues", icon: Building2 },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/budget", label: "Budget", icon: DollarSign },
  { href: "/vendors", label: "Vendors", icon: Users },
  { href: "/contracts", label: "Contracts", icon: FileText },
] as const;

type DashboardShellProps = {
  partner1: string;
  partner2: string;
  countdownLabel: string | null;
  weddingDateLabel: string | null;
  children: React.ReactNode;
};

export function DashboardShell({
  partner1,
  partner2,
  countdownLabel,
  weddingDateLabel,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const buddy = useBuddyDrawer();

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-primary)]">
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-[240px] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="px-5 pt-8">
          <Link href="/dashboard" className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
            Aisle
          </Link>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-0.5 px-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-l-[3px] border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                    : "border-l-[3px] border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-[var(--color-border)] px-4 py-5">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {partner1} & {partner2}
          </p>
          {countdownLabel ? (
            <p className="mt-1 text-sm font-semibold text-[var(--color-accent)]">{countdownLabel}</p>
          ) : (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Set your wedding date</p>
          )}
          {weddingDateLabel ? (
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{weddingDateLabel}</p>
          ) : null}
          <Link
            href="/settings"
            className={cn(
              "mt-4 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/settings")
                ? "border-l-[3px] border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                : "border-l-[3px] border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]",
            )}
          >
            <Settings className="size-4 shrink-0" aria-hidden />
            Settings
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 pl-[240px]">
        <main className="mx-auto w-full max-w-[1100px] flex-1 p-5 md:p-10">{children}</main>
      </div>

      <button
        type="button"
        aria-label="Open AI Buddy"
        onClick={() => buddy.setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-card transition-transform hover:scale-105 hover:bg-accent-hover"
      >
        <span className="text-lg font-semibold">✦</span>
      </button>

      <BuddyDrawer open={buddy.open} onOpenChange={buddy.setOpen} />
    </div>
  );
}
