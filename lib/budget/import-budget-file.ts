/**
 * Client-safe parsing for budget import (CSV + XLSX).
 * Column names are matched loosely so templates from Sheets/Excel still work.
 */

export type BudgetImportRow = {
  category_label: string;
  estimated_cost?: number | null;
  quoted_cost?: number | null;
  deposit_paid?: number | null;
  balance_due_date?: string | null;
  notes?: string | null;
};

function normalizeKey(k: string): string {
  return k.trim().toLowerCase().replace(/\s+/g, " ");
}

function stringVal(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  return String(v).trim();
}

function parseMoney(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).replaceAll(/[$,\s]/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseDueDate(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

function getValue(row: Record<string, unknown>, patterns: string[]): unknown {
  const entries = Object.entries(row);
  for (const p of patterns) {
    const np = normalizeKey(p);
    for (const [k, v] of entries) {
      if (normalizeKey(k) === np) return v;
    }
  }
  for (const p of patterns) {
    const np = normalizeKey(p);
    for (const [k, v] of entries) {
      const nk = normalizeKey(k);
      if (nk.includes(np) || np.includes(nk)) return v;
    }
  }
  return undefined;
}

export function recordToBudgetImportRow(row: Record<string, unknown>): BudgetImportRow | null {
  const cat = stringVal(getValue(row, ["category", "category name", "name"]));
  if (!cat) return null;
  const notesRaw = stringVal(getValue(row, ["notes", "note"]));
  return {
    category_label: cat,
    estimated_cost: parseMoney(getValue(row, ["estimated cost", "estimated", "estimate"])),
    quoted_cost: parseMoney(getValue(row, ["quoted cost", "quoted", "quote"])),
    deposit_paid: parseMoney(getValue(row, ["deposit paid", "deposit"])),
    balance_due_date: parseDueDate(getValue(row, ["due date", "duedate", "balance due date"])),
    notes: notesRaw ? notesRaw : null,
  };
}

/** RFC-style CSV parser (quoted fields, commas, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cur);
    cur = "";
  };

  const pushRow = () => {
    if (row.length > 1 || (row.length === 1 && row[0]!.trim() !== "")) {
      rows.push(row);
    }
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      pushCell();
    } else if (c === "\n") {
      pushCell();
      pushRow();
    } else if (c === "\r") {
      if (text[i + 1] === "\n") i++;
      pushCell();
      pushRow();
    } else {
      cur += c;
    }
  }
  pushCell();
  if (row.some((cell) => cell.trim() !== "")) pushRow();
  return rows;
}

export function parseBudgetImportCsv(text: string): BudgetImportRow[] {
  const table = parseCsv(text.replace(/^\uFEFF/, ""));
  if (table.length < 2) return [];
  const headers = table[0]!.map((h) => h.trim());
  const out: BudgetImportRow[] = [];
  for (let r = 1; r < table.length; r++) {
    const cells = table[r]!;
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      obj[h] = cells[idx] ?? "";
    });
    const parsed = recordToBudgetImportRow(obj);
    if (parsed) out.push(parsed);
  }
  return out;
}

export async function parseBudgetImportXlsx(buf: ArrayBuffer): Promise<BudgetImportRow[]> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const name = wb.SheetNames[0];
  if (!name) return [];
  const sheet = wb.Sheets[name];
  if (!sheet) return [];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return json.map(recordToBudgetImportRow).filter((r): r is BudgetImportRow => r != null);
}
