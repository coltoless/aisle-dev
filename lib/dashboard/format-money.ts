export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Abbreviated USD for dashboard stats, e.g. $41.2K, $60K. */
export function formatUsdAbbreviated(cents: number): string {
  const dollars = cents / 100;
  if (!Number.isFinite(dollars) || dollars === 0) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(0);
  }
  const sign = dollars < 0 ? "-" : "";
  const v = Math.abs(dollars);
  if (v >= 1_000_000) {
    const m = v / 1_000_000;
    const s = m >= 100 ? String(Math.round(m)) : m.toFixed(1).replace(/\.0$/, "");
    return `${sign}$${s}M`;
  }
  if (v >= 1000) {
    const k = v / 1000;
    const s = k >= 100 ? `${Math.round(k)}K` : `${k.toFixed(1).replace(/\.0$/, "")}K`;
    return `${sign}$${s}`;
  }
  return `${sign}${formatUsdFromCents(Math.round(v * 100))}`;
}
