"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepTransition } from "@/components/onboarding/onboarding-step-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUDGET_RANGES, GUEST_COUNT_RANGES, WEDDING_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

function parseCityState(line: string): { city: string; state: string } {
  const trimmed = line.trim();
  if (!trimmed) return { city: "", state: "" };
  const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const state = parts[parts.length - 1] ?? "";
    const city = parts.slice(0, -1).join(", ");
    return { city, state };
  }
  return { city: trimmed, state: "" };
}

export function OnboardingStep2() {
  const router = useRouter();
  const weddingDate = useOnboardingStore((s) => s.weddingDate);
  const hasDate = useOnboardingStore((s) => s.hasDate);
  const locationCity = useOnboardingStore((s) => s.locationCity);
  const locationState = useOnboardingStore((s) => s.locationState);
  const guestCountRange = useOnboardingStore((s) => s.guestCountRange);
  const budgetRange = useOnboardingStore((s) => s.budgetRange);
  const styleTags = useOnboardingStore((s) => s.styleTags);
  const setField = useOnboardingStore((s) => s.setField);
  const setStyleTag = useOnboardingStore((s) => s.setStyleTag);

  const [locationLine, setLocationLine] = useState("");

  useEffect(() => {
    if (locationCity || locationState) {
      setLocationLine([locationCity, locationState].filter(Boolean).join(", "));
    }
  }, [locationCity, locationState]);

  const dateOk = !hasDate || Boolean(weddingDate);
  const locationOk = Boolean(locationCity.trim() && locationState.trim());
  const guestOk = Boolean(guestCountRange);
  const budgetOk = Boolean(budgetRange);
  const stylesOk = styleTags.length >= 1;

  const canContinue = dateOk && locationOk && guestOk && budgetOk && stylesOk;

  const applyLocationBlur = () => {
    const { city, state } = parseCityState(locationLine);
    setField("locationCity", city);
    setField("locationState", state);
  };

  return (
    <OnboardingStepTransition>
      <h1 className="text-center font-display text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">
        Tell us about the day you&apos;re planning.
      </h1>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <Label className="text-[var(--color-text-secondary)]">Wedding date</Label>
          <Input
            type="date"
            disabled={!hasDate}
            value={weddingDate ?? ""}
            onChange={(e) => setField("weddingDate", e.target.value || null)}
            className="h-11 max-w-xs border-[var(--color-border)] bg-[var(--color-bg-card)] disabled:opacity-50"
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={!hasDate}
              onChange={(e) => {
                const noDate = e.target.checked;
                setField("hasDate", !noDate);
                if (noDate) {
                  setField("weddingDate", null);
                }
              }}
              className="size-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
            />
            We haven&apos;t set a date yet
          </label>
        </section>

        <section className="space-y-2">
          <Label htmlFor="loc" className="text-[var(--color-text-secondary)]">
            Location
          </Label>
          <Input
            id="loc"
            value={locationLine}
            onChange={(e) => setLocationLine(e.target.value)}
            onBlur={applyLocationBlur}
            placeholder="Nashville, TN"
            className="h-11 border-[var(--color-border)] bg-[var(--color-bg-card)]"
          />
        </section>

        <section className="space-y-3">
          <Label className="text-[var(--color-text-secondary)]">How many guests are you expecting?</Label>
          <div className="grid gap-2">
            {GUEST_COUNT_RANGES.map((opt) => {
              const selected = guestCountRange === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setField("guestCountRange", opt.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition-colors",
                    selected
                      ? "border-accent bg-accent-muted text-accent"
                      : "border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                      selected ? "border-accent bg-accent" : "border-[var(--color-text-muted)]",
                    )}
                  >
                    {selected ? <span className="size-2 rounded-full bg-white" /> : null}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <Label className="text-[var(--color-text-secondary)]">What&apos;s your overall budget?</Label>
          <div className="grid gap-2">
            {BUDGET_RANGES.map((opt) => {
              const selected = budgetRange === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setField("budgetRange", opt.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition-colors",
                    selected
                      ? "border-accent bg-accent-muted text-accent"
                      : "border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                      selected ? "border-accent bg-accent" : "border-[var(--color-text-muted)]",
                    )}
                  >
                    {selected ? <span className="size-2 rounded-full bg-white" /> : null}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <Label className="text-[var(--color-text-secondary)]">
            What&apos;s the feel of your wedding? Pick up to 3.
          </Label>
          <div className="flex flex-wrap gap-2">
            {WEDDING_STYLES.map((s) => {
              const on = styleTags.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyleTag(s.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    on
                      ? "border-accent bg-accent text-white"
                      : "border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-accent/50",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <Button
        type="button"
        className="mt-12 h-11 w-full bg-accent text-accent-foreground hover:bg-accent-hover"
        disabled={!canContinue}
        onClick={() => router.push("/onboarding/3")}
      >
        Continue →
      </Button>
    </OnboardingStepTransition>
  );
}
