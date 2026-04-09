"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepTransition } from "@/components/onboarding/onboarding-step-transition";
import { Button } from "@/components/ui/button";
import { BUDGET_RANGES, GUEST_COUNT_RANGES, WEDDING_STYLES } from "@/lib/constants";
import { useOnboardingStore } from "@/store/onboardingStore";
import type { OnboardingCompleteRequest } from "@/types/api";

const INTRO_FALLBACK =
  "Welcome! Your checklist and budget are ready. I'm here whenever you have a question.";

function styleLabels(ids: string[]) {
  return ids
    .map((id) => WEDDING_STYLES.find((s) => s.id === id)?.label ?? id)
    .join(" · ");
}

export function OnboardingStep4() {
  const router = useRouter();
  const ran = useRef(false);

  const weddingDate = useOnboardingStore((s) => s.weddingDate);
  const hasDate = useOnboardingStore((s) => s.hasDate);
  const locationCity = useOnboardingStore((s) => s.locationCity);
  const locationState = useOnboardingStore((s) => s.locationState);
  const guestCountRange = useOnboardingStore((s) => s.guestCountRange);
  const budgetRange = useOnboardingStore((s) => s.budgetRange);
  const styleTags = useOnboardingStore((s) => s.styleTags);
  const reset = useOnboardingStore((s) => s.reset);

  const [introText, setIntroText] = useState<string | null>(null);
  const [introLoading, setIntroLoading] = useState(true);
  const [completeOk, setCompleteOk] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const {
      partner1Name: p1,
      partner2Name: p2,
      weddingDate: wd,
      hasDate: hd,
      locationCity: lc,
      locationState: ls,
      guestCountRange: gcr,
      budgetRange: br,
      styleTags: st,
      priorities: pr,
      setAIIntroMessage: setIntro,
    } = useOnboardingStore.getState();

    const payload: OnboardingCompleteRequest = {
      partner1Name: p1.trim(),
      partner2Name: p2.trim(),
      weddingDate: hd ? wd : null,
      locationCity: lc.trim(),
      locationState: ls.trim(),
      locationCountry: "US",
      guestCountRange: gcr,
      budgetRange: br,
      styleTags: st,
      priorities: pr,
    };

    const introBody = {
      partner1Name: p1.trim(),
      partner2Name: p2.trim(),
      weddingDate: hd ? wd : null,
      location: [lc.trim(), ls.trim()].filter(Boolean).join(", "),
      guestCountRange: gcr,
      budgetRange: br,
      styleTags: st,
      topPriorities: pr.slice(0, 3),
    };

    const run = async () => {
      const [completeRes, introRes] = await Promise.all([
        fetch("/api/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/ai/onboarding-intro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(introBody),
        }),
      ]);

      if (completeRes.status === 409) {
        setCompleteOk(true);
      } else if (completeRes.ok) {
        setCompleteOk(true);
      } else {
        let msg = "Could not save your profile.";
        try {
          const err = await completeRes.json();
          if (err?.error) msg = err.error;
        } catch {
          /* ignore */
        }
        setCompleteError(msg);
      }

      let message = INTRO_FALLBACK;
      try {
        if (introRes.ok) {
          const data = (await introRes.json()) as { message?: string };
          if (data.message?.trim()) message = data.message.trim();
        }
      } catch {
        message = INTRO_FALLBACK;
      }

      setIntroText(message);
      setIntro(message);
      setIntroLoading(false);
    };

    void run();
  }, []);

  const guestLabel = GUEST_COUNT_RANGES.find((g) => g.id === guestCountRange)?.label ?? guestCountRange;
  const budgetLabel = BUDGET_RANGES.find((b) => b.id === budgetRange)?.label ?? budgetRange;
  const dateDisplay =
    hasDate && weddingDate
      ? new Date(weddingDate + "T12:00:00").toLocaleDateString(undefined, {
          dateStyle: "long",
        })
      : "Date TBD";
  const locationDisplay = [locationCity, locationState].filter(Boolean).join(", ");

  const canClickPlanning = Boolean(introText && !introLoading && completeOk);

  return (
    <OnboardingStepTransition>
      <h1 className="text-center font-display text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">
        Here&apos;s what we&apos;ve got.
      </h1>

      <div className="mt-10 space-y-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
          <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
            <li>
              <span className="mr-2" aria-hidden>
                📅
              </span>
              <span className="font-medium text-[var(--color-text-primary)]">Wedding date:</span> {dateDisplay}
            </li>
            <li>
              <span className="mr-2" aria-hidden>
                📍
              </span>
              <span className="font-medium text-[var(--color-text-primary)]">Location:</span> {locationDisplay || "—"}
            </li>
            <li>
              <span className="mr-2" aria-hidden>
                👥
              </span>
              <span className="font-medium text-[var(--color-text-primary)]">Guests:</span> {guestLabel}
            </li>
            <li>
              <span className="mr-2" aria-hidden>
                💰
              </span>
              <span className="font-medium text-[var(--color-text-primary)]">Budget:</span> {budgetLabel}
            </li>
            <li>
              <span className="mr-2" aria-hidden>
                ✨
              </span>
              <span className="font-medium text-[var(--color-text-primary)]">Vibe:</span>{" "}
              {styleTags.length ? styleLabels(styleTags) : "—"}
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">A note from Aisle</h2>
          <div className="mt-4 min-h-[4.5rem]">
            {introLoading ? (
              <div className="space-y-2" aria-busy="true">
                <div className="h-3 w-full animate-pulse rounded bg-[var(--color-bg-subtle)]" />
                <div className="h-3 w-[92%] animate-pulse rounded bg-[var(--color-bg-subtle)]" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{introText}</p>
            )}
          </div>
        </div>
      </div>

      {completeError ? (
        <p className="mt-4 text-center text-sm text-[var(--color-status-error)]" role="alert">
          {completeError}
        </p>
      ) : null}

      <Button
        type="button"
        className="mt-10 h-11 w-full bg-accent text-accent-foreground hover:bg-accent-hover"
        disabled={!canClickPlanning}
        onClick={() => {
          reset();
          router.push("/dashboard");
          router.refresh();
        }}
      >
        Let&apos;s Get Planning →
      </Button>

      {!canClickPlanning && !completeError ? (
        <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">Saving your plan and drafting your note…</p>
      ) : null}
    </OnboardingStepTransition>
  );
}
