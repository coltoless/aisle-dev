"use client";

import { useRouter } from "next/navigation";
import { OnboardingStepTransition } from "@/components/onboarding/onboarding-step-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboardingStore } from "@/store/onboardingStore";

export function OnboardingStep1() {
  const router = useRouter();
  const partner1Name = useOnboardingStore((s) => s.partner1Name);
  const partner2Name = useOnboardingStore((s) => s.partner2Name);
  const setField = useOnboardingStore((s) => s.setField);

  const canContinue = Boolean(partner1Name.trim() && partner2Name.trim());

  return (
    <OnboardingStepTransition duration={0.4}>
      <h1 className="text-center font-display text-4xl font-semibold leading-tight text-[var(--color-text-primary)]">
        Let&apos;s start with the two
        <br />
        most important people.
      </h1>
      <p className="mt-4 text-center text-sm italic text-[var(--color-text-muted)]">
        We&apos;ll use these throughout your planning experience.
      </p>
      <div className="mt-12 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="p1" className="text-[var(--color-text-secondary)]">
            Partner 1 name
          </Label>
          <Input
            id="p1"
            value={partner1Name}
            onChange={(e) => setField("partner1Name", e.target.value)}
            className="h-11 border-[var(--color-border)] bg-[var(--color-bg-card)]"
            placeholder="First name"
            autoComplete="given-name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p2" className="text-[var(--color-text-secondary)]">
            Partner 2 name
          </Label>
          <Input
            id="p2"
            value={partner2Name}
            onChange={(e) => setField("partner2Name", e.target.value)}
            className="h-11 border-[var(--color-border)] bg-[var(--color-bg-card)]"
            placeholder="First name"
            autoComplete="given-name"
            required
          />
        </div>
      </div>
      <Button
        type="button"
        className="mt-10 h-11 w-full bg-accent text-accent-foreground hover:bg-accent-hover"
        disabled={!canContinue}
        onClick={() => router.push("/onboarding/2")}
      >
        Continue →
      </Button>
    </OnboardingStepTransition>
  );
}
