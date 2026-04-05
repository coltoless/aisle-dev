import { NextRequest } from "next/server";
import { jsonError } from "@/lib/api/responses";
import type { OnboardingCompleteRequest } from "@/types/api";

function isOnboardingComplete(body: unknown): body is OnboardingCompleteRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.partner1Name === "string" &&
    typeof b.partner2Name === "string" &&
    (b.weddingDate === null || typeof b.weddingDate === "string") &&
    typeof b.locationCity === "string" &&
    typeof b.locationState === "string" &&
    typeof b.locationCountry === "string" &&
    typeof b.guestCountRange === "string" &&
    typeof b.budgetRange === "string" &&
    Array.isArray(b.styleTags) &&
    b.styleTags.every((t) => typeof t === "string") &&
    Array.isArray(b.priorities) &&
    b.priorities.every((p) => typeof p === "string")
  );
}

/** Persist onboarding answers, seed checklist/budget, return AI intro for step 4. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON", { code: "INVALID_JSON" });
  }

  if (!isOnboardingComplete(body)) {
    return jsonError(400, "Invalid onboarding payload", { code: "INVALID_BODY" });
  }

  return jsonError(501, "Onboarding persistence not implemented yet", {
    code: "NOT_IMPLEMENTED",
  });
}
