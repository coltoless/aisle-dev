import { NextRequest } from "next/server";
import { jsonError } from "@/lib/api/responses";
import type { AddChecklistItemRequest } from "@/types/api";

function isAddChecklistItem(body: unknown): body is AddChecklistItemRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.coupleId === "string" &&
    b.coupleId.trim() !== "" &&
    typeof b.title === "string" &&
    typeof b.category === "string" &&
    typeof b.phase === "string" &&
    typeof b.is_custom === "boolean" &&
    (b.due_date === undefined || typeof b.due_date === "string") &&
    (b.notes === undefined || typeof b.notes === "string")
  );
}

/** Server-side checklist insert (e.g. AI tool executor). */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON", { code: "INVALID_JSON" });
  }

  if (!isAddChecklistItem(body)) {
    return jsonError(400, "Invalid checklist item payload", { code: "INVALID_BODY" });
  }

  return jsonError(501, "Checklist insert not implemented yet", {
    code: "NOT_IMPLEMENTED",
  });
}
