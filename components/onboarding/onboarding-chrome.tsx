"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OnboardingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  const stepMatch = pathname?.match(/^\/onboarding\/(\d)/);
  const step = stepMatch ? Number(stepMatch[1]) : 0;
  if (step < 1 || step > 4) {
    return <>{children}</>;
  }

  const pct = step * 25;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)]">
      <div className="h-1 w-full bg-[var(--color-border)]">
        <div
          className="h-full bg-accent transition-[width] duration-300 ease-in-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="px-4 pt-2 text-center text-xs text-[var(--color-text-muted)]">
        Step {step} of 4
      </p>
      <div className="relative flex flex-1 flex-col px-5 pb-12 pt-2">
        {step > 1 ? (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-2 gap-1 text-[var(--color-text-secondary)]"
            asChild
          >
            <Link href={`/onboarding/${step - 1}`}>
              <ChevronLeft className="size-4" aria-hidden />
              Back
            </Link>
          </Button>
        ) : null}
        <div className={cn("mx-auto w-full max-w-[560px] flex-1 pt-10", step > 1 && "pt-12")}>
          {children}
        </div>
      </div>
    </div>
  );
}
