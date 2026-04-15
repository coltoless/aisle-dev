export function todayIsoLocal(): string {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysFromToday(due: string, today: string): number {
  const a = parseLocalDate(today).getTime();
  const b = parseLocalDate(due).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Snooze hides a task from “active” work until this date (inclusive of that day as still snoozed if > today). */
export function isSnoozeActive(snoozedUntil: string | null, today: string): boolean {
  if (!snoozedUntil) return false;
  return snoozedUntil > today;
}

export function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
