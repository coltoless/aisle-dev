"use client";

import { usePathname } from "next/navigation";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname?.startsWith("/onboarding") ?? false;

  if (isOnboarding) {
    return <div className="min-h-screen bg-[var(--color-bg-primary)]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)]">
      <header className="flex shrink-0 justify-center pb-6 pt-10">
        <span className="font-display text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Aisle
        </span>
      </header>
      <div className="flex flex-1 flex-col items-center px-5 pb-12">{children}</div>
    </div>
  );
}
