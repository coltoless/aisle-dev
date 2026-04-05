import { NextRequest } from "next/server";
import { jsonError } from "@/lib/api/responses";
import type { BudgetFlagRequest } from "@/types/api";

const severities = new Set(["info", "warning", "critical"]);

function isBudgetFlag(body: unknown): body is BudgetFlagRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.coupleId === "string" &&
    b.coupleId.trim() !== "" &&
    typeof b.category === "string" &&
    typeof b.reason === "string" &&
    typeof b.severity === "string" &&
    severities.has(b.severity)
  );
}

/** Record an AI-triggered budget flag. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON", { code: "INVALID_JSON" });
  }

  if (!isBudgetFlag(body)) {
    return jsonError(400, "Invalid budget flag payload", { code: "INVALID_BODY" });
  }

  return jsonError(501, "Budget flag persistence not implemented yet", {
    code: "NOT_IMPLEMENTED",
  });
}
