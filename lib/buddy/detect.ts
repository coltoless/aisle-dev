import type { BuddyChatMode } from "@/types/api";

const EMAIL_OPEN_RE = /^(Dear|Hi|Hello)\s+[^\n,]+[,]/im;

export function looksLikeEmailDraft(content: string, mode: BuddyChatMode): boolean {
  if (mode !== "vendor_email") return false;
  return EMAIL_OPEN_RE.test(content.trim());
}

export function splitEmailBody(content: string): { before: string; email: string; after: string } | null {
  const t = content.trim();
  const m = t.match(EMAIL_OPEN_RE);
  if (!m || m.index === undefined) return null;
  const start = m.index;
  const lines = t.slice(start).split("\n");
  let endLine = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (
      /^(Best,|Warmly,|Thanks,|Sincerely,|Kind regards,)/i.test(line.trim()) ||
      (i > 4 && line.trim() === "")
    ) {
      endLine = i + 1;
      break;
    }
    endLine = i + 1;
  }
  const email = lines.slice(0, endLine).join("\n").trim();
  const before = t.slice(0, start).trim();
  const after = t.slice(start + email.length).trim();
  return { before, email, after: after.replace(/^\n+/, "") };
}

export function looksLikeVisionBoard(content: string, mode: BuddyChatMode): boolean {
  if (mode !== "vision_board") return false;
  return /\bMOOD TITLE\s*:/i.test(content);
}

export function looksLikeTimeline(content: string, mode: BuddyChatMode): boolean {
  if (mode !== "timeline") return false;
  const re = /\b\d{1,2}:\d{2}\s*(AM|PM)\b/gi;
  const matches = content.match(re);
  return matches != null && matches.length >= 3;
}

const TIME_RE = /^(\d{1,2}:\d{2}\s*(?:AM|PM))\b\s*[–—-]?\s*(.+)$/i;

export type TimelineRowParsed = { time: string; title: string; note: string };

export function parseTimelineRows(content: string): TimelineRowParsed[] {
  const rows: TimelineRowParsed[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const t = line.trim();
    const m = t.match(TIME_RE);
    if (m) {
      rows.push({ time: m[1]!.trim(), title: (m[2] ?? "").trim(), note: "" });
 continue;
    }
    if (rows.length > 0 && t && !TIME_RE.test(t) && !/^[•\-*]\s/.test(t)) {
      const last = rows[rows.length - 1]!;
      last.note = last.note ? `${last.note} ${t}` : t;
    }
  }
  return rows;
}

export function parseVisionPalette(content: string): { name: string; hex: string }[] {
  const section = content.split(/\bPALETTE\s*:/i)[1]?.split(/\bATMOSPHERE\s*:/i)[0] ?? "";
  const out: { name: string; hex: string }[] = [];
  for (const line of section.split("\n")) {
    const m = line.match(/#([0-9a-fA-F]{6})/);
    if (m) {
      const hex = `#${m[1]}`;
      const name = line.replace(/#([0-9a-fA-F]{6})/, "").replace(/^[-•*\d.)]+\s*/, "").trim();
      out.push({ name: name.replace(/[,–—-]+$/, "").trim() || hex, hex });
    }
  }
  return out.slice(0, 5);
}

export function extractMoodTitle(content: string): string {
  const part = content.split(/\bMOOD TITLE\s*:/i)[1] ?? "";
  const line = part.split("\n")[0]?.trim() ?? "";
  return line.replace(/^[\d.)]+\s*/, "").trim() || "Your vision";
}
