/** Format wedding date from DB (YYYY-MM-DD) for sidebar countdown. */
export function weddingSidebarCopy(weddingDate: string | null): {
  countdownLabel: string | null;
  dateLine: string | null;
} {
  if (!weddingDate) {
    return { countdownLabel: null, dateLine: null };
  }

  const [y, m, d] = weddingDate.split("-").map(Number);
  if (!y || !m || !d) {
    return { countdownLabel: null, dateLine: null };
  }

  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  const dateLine = target.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (diff > 1) {
    return { countdownLabel: `${diff} days`, dateLine };
  }
  if (diff === 1) {
    return { countdownLabel: "1 day", dateLine };
  }
  if (diff === 0) {
    return { countdownLabel: "Today", dateLine };
  }

  return { countdownLabel: null, dateLine };
}
