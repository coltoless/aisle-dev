"use client";

import { useEffect, useState } from "react";

function greetingForHour(h: number): string {
  if (h < 12) return "GOOD MORNING";
  if (h < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

export function DashboardGreeting() {
  const [label, setLabel] = useState("GOOD MORNING");

  useEffect(() => {
    setLabel(greetingForHour(new Date().getHours()));
  }, []);

  return (
    <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
      {label}
    </p>
  );
}
