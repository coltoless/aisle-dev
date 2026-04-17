/**
 * Client-safe parsing for budget import (CSV + XLSX).
 * Detects header row + column meanings heuristically; supports many spreadsheet layouts.
 */

export type BudgetImportValueKey =
  | "estimated_cost"
  | "quoted_cost"
  | "deposit_paid"
  | "balance_due_date"
  | "notes";

import { parseBudgetDueDateFromImport } from "./due-date";

export type BudgetImportRow = {
  category_label: string;
  estimated_cost?: number | null;
  quoted_cost?: number | null;
  deposit_paid?: number | null;
  balance_due_date?: string | null;
  notes?: string | null;
  /**
   * Fields that had a mapped column in the file. Used for updates: only these keys
   * are sent to the server so unspecified columns are not cleared.
   */
  valueFieldsFromFile: Set<BudgetImportValueKey>;
};

type FieldKey = "category" | "estimated" | "quoted" | "deposit" | "due" | "notes";

const FIELD_KEYWORDS: Record<FieldKey, readonly string[]> = {
  category: [
    "category",
    "category name",
    "budget category",
    "line item",
    "line",
    "item",
    "vendor",
    "supplier",
    "description",
    "expense",
    "service",
    "area",
    "department",
    "type",
  ],
  estimated: [
    "estimated",
    "estimate",
    "budget",
    "planned",
    "allocation",
    "projected",
    "target",
    "est",
    "planned cost",
    "budgeted",
  ],
  quoted: [
    "quoted",
    "quote",
    "contract",
    "contract price",
    "final",
    "invoice",
    "actual",
    "vendor cost",
    "agreed",
    "price",
    "total",
    "amount",
    "cost",
    "subtotal",
  ],
  deposit: [
    "deposit",
    "retainer",
    "down payment",
    "paid to date",
    "amount paid",
    "payment to date",
    "prepaid",
    "paid so far",
  ],
  due: [
    "due date",
    "due",
    "pay by",
    "deadline",
    "payment date",
    "balance date",
    "remit by",
  ],
  notes: ["notes", "note", "comment", "comments", "memo", "details", "remarks"],
};

export type ColumnIndexMap = Record<FieldKey, number | null>;

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

/** Parse currency / accounting numbers (US + many EU-ish formats). Dollars in file → number. */
export function parseMoney(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  let s = String(v).trim();
  if (!s) return null;
  s = s.replace(/[$£€¥\s]/g, "");
  if (/^\(.*\)$/.test(s)) {
    s = `-${s.slice(1, -1)}`;
  }
  if (s.endsWith("-")) {
    s = `-${s.slice(0, -1)}`;
  }
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma && !hasDot) {
    const parts = s.split(",");
    if (parts.length === 2 && parts[1]!.length <= 2) {
      s = `${parts[0]!.replace(/\s/g, "")}.${parts[1]}`;
    } else {
      s = s.replace(/,/g, "");
    }
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export const parseDueDate = parseBudgetDueDateFromImport;

function scoreHeader(header: string, keywords: readonly string[]): number {
  const h = normalizeKey(header);
  if (!h) return 0;
  let score = 0;
  for (const kw of keywords) {
    const k = normalizeKey(kw);
    if (!k) continue;
    if (h === k) score += 12;
    else if (h.startsWith(k + " ") || h.endsWith(" " + k)) score += 8;
    else if (h.includes(k)) score += 5;
  }
  if (h === "total" || h === "amount") score = Math.min(score, 6);
  return score;
}

/** Map each logical field to a column index using header labels (row of strings). */
export function buildColumnIndexMap(headerCells: string[]): ColumnIndexMap {
  const headers = headerCells.map((c) => String(c).trim());
  const used = new Set<number>();
  const map: ColumnIndexMap = {
    category: null,
    estimated: null,
    quoted: null,
    deposit: null,
    due: null,
    notes: null,
  };

  const fields: FieldKey[] = ["category", "estimated", "quoted", "deposit", "due", "notes"];
  for (const field of fields) {
    let best: { idx: number; s: number } | null = null;
    for (let idx = 0; idx < headers.length; idx++) {
      if (used.has(idx)) continue;
      const label = headers[idx]!;
      if (!label) continue;
      const s = scoreHeader(label, FIELD_KEYWORDS[field]);
      if (s > 0 && (!best || s > best.s)) best = { idx, s };
    }
    const minScore = field === "category" ? 4 : 5;
    if (best && best.s >= minScore) {
      map[field] = best.idx;
      used.add(best.idx);
    }
  }

  if (map.category === null && headers.length > 0) {
    map.category = 0;
  }

  return map;
}

function detectHeaderRowAndMap(table: string[][]): { headerRow: number; map: ColumnIndexMap } | null {
  const maxScan = Math.min(45, table.length);
  for (let i = 0; i < maxScan; i++) {
    const row = table[i];
    if (!row || row.length < 2) continue;
    const labels = row.map((c) => String(c).trim());
    const nonempty = labels.filter((h) => h.length > 0).length;
    if (nonempty < 2) continue;
    const map = buildColumnIndexMap(row.map((c) => String(c)));
    if (map.category !== null) {
      return { headerRow: i, map };
    }
  }
  return null;
}

function getCell(row: string[], idx: number | null): unknown {
  if (idx == null || idx < 0 || idx >= row.length) return undefined;
  return row[idx];
}

export function cellsToBudgetImportRow(row: string[], map: ColumnIndexMap): BudgetImportRow | null {
  const ci = map.category;
  if (ci == null) return null;
  const cat = stringVal(getCell(row, ci));
  if (!cat) return null;

  const valueFieldsFromFile = new Set<BudgetImportValueKey>();
  const out: BudgetImportRow = { category_label: cat, valueFieldsFromFile };

  const cellLooksEmpty = (raw: unknown) =>
    raw == null || (typeof raw === "string" && raw.trim() === "");

  const take = (idx: number | null, field: BudgetImportValueKey, parse: (v: unknown) => unknown) => {
    if (idx == null) return;
    const raw = getCell(row, idx);
    if (raw === undefined) return;
    const parsed = parse(raw);
    // Do not wipe an existing due date when the cell is a non-date (e.g. dollar amount "5000").
    if (field === "balance_due_date" && parsed == null && !cellLooksEmpty(raw)) return;
    valueFieldsFromFile.add(field);
    (out as Record<string, unknown>)[field] = parsed;
  };

  take(map.estimated, "estimated_cost", parseMoney);
  take(map.quoted, "quoted_cost", parseMoney);
  take(map.deposit, "deposit_paid", parseMoney);
  take(map.due, "balance_due_date", parseDueDate);
  take(map.notes, "notes", (v) => {
    const s = stringVal(v);
    return s ? s : null;
  });

  return out;
}

function parseTableToRows(table: string[][]): BudgetImportRow[] {
  const detected = detectHeaderRowAndMap(table);
  if (!detected) return [];
  const out: BudgetImportRow[] = [];
  for (let r = detected.headerRow + 1; r < table.length; r++) {
    const row = table[r] ?? [];
    if (!row.some((c) => String(c).trim() !== "")) continue;
    const parsed = cellsToBudgetImportRow(row.map((c) => String(c)), detected.map);
    if (parsed) out.push(parsed);
  }
  return out;
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
  const table = parseCsv(text.replace(/^\uFEFF/, "")).map((row) => row.map((c) => String(c)));
  if (table.length < 2) return [];
  return parseTableToRows(table);
}

export async function parseBudgetImportXlsx(buf: ArrayBuffer): Promise<BudgetImportRow[]> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;
    const aoa = XLSX.utils.sheet_to_json<(string | number | boolean | Date | null | undefined)[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
    }) as unknown[][];
    const table: string[][] = aoa.map((row) =>
      (row ?? []).map((cell) => {
        if (cell == null) return "";
        if (cell instanceof Date) return cell.toISOString().slice(0, 10);
        if (typeof cell === "number" && Number.isFinite(cell)) {
          if (cell > 20000 && cell < 120000) return String(cell);
          return String(cell);
        }
        return String(cell);
      }),
    );
    const rows = parseTableToRows(table);
    if (rows.length > 0) return rows;
  }
  return [];
}
