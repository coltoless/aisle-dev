/**
 * Budget due dates: import parsing + normalization for DB/API.
 * Guards against money amounts (e.g. "5000") being parsed as years via Date.parse.
 */

export const BUDGET_DUE_YEAR_MIN = 1990;
export const BUDGET_DUE_YEAR_MAX = 2125;

function isoYear(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const y = Number(iso.slice(0, 4));
  return Number.isFinite(y) ? y : null;
}

/** True if YYYY-MM-DD is in the allowed calendar range for wedding budgets. */
export function isReasonableBudgetDueIso(iso: string): boolean {
  const y = isoYear(iso);
  if (y == null || y < BUDGET_DUE_YEAR_MIN || y > BUDGET_DUE_YEAR_MAX) return false;
  const t = Date.parse(`${iso}T12:00:00.000Z`);
  return !Number.isNaN(t);
}

/** Strips impossible dates from DB/API (e.g. import bugs). */
export function normalizeBudgetDueDateStored(v: string | null | undefined): string | null {
  const s = v?.trim();
  if (!s) return null;
  if (isReasonableBudgetDueIso(s)) return s;
  return null;
}

function utcIsoFromExcelSerial(serial: number): string {
  const epoch = Date.UTC(1899, 11, 30);
  const day = Math.floor(serial);
  const ms = epoch + day * 86400000;
  const d = new Date(ms);
  return d.toISOString().slice(0, 10);
}

function tryExcelSerialToReasonableIso(v: number): string | null {
  if (!Number.isFinite(v)) return null;
  if (v <= 0 || v > 1_000_000) return null;
  const iso = utcIsoFromExcelSerial(v);
  return isReasonableBudgetDueIso(iso) ? iso : null;
}

/**
 * Parse a cell value from CSV/XLSX into YYYY-MM-DD or null.
 * - Rejects bare numbers/strings that are money amounts (e.g. 5000 → not year 5000).
 * - Excel serials must decode to a year in {@link BUDGET_DUE_YEAR_MIN}…{@link BUDGET_DUE_YEAR_MAX}.
 */
export function parseBudgetDueDateFromImport(v: unknown): string | null {
  if (v == null || v === "") return null;

  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const iso = v.toISOString().slice(0, 10);
    return isReasonableBudgetDueIso(iso) ? iso : null;
  }

  if (typeof v === "number" && Number.isFinite(v)) {
    return tryExcelSerialToReasonableIso(v);
  }

  const s = String(v).trim();
  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return isReasonableBudgetDueIso(s) ? s : null;
  }

  // Integer / decimal with no date separators — usually money or Excel serial as text.
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    return tryExcelSerialToReasonableIso(n);
  }

  // Slash / locale / month names — avoid Date.parse on digit-only strings (handled above).
  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) {
    const iso = new Date(parsed).toISOString().slice(0, 10);
    return isReasonableBudgetDueIso(iso) ? iso : null;
  }

  return null;
}
