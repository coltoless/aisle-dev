import { NextRequest } from "next/server";
import { jsonError } from "@/lib/api/responses";
import type { VenueRecommendationRequest, VenueRecommendationResponse } from "@/types/api";

function isVenueRequest(body: unknown): body is VenueRecommendationRequest {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as VenueRecommendationRequest).coupleId === "string" &&
    (body as VenueRecommendationRequest).coupleId.trim() !== ""
  );
}

/** Generate venue recommendations (Claude + web search / curated data). */
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return jsonError(503, "ANTHROPIC_API_KEY is not configured", {
      code: "SERVICE_UNAVAILABLE",
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON", { code: "INVALID_JSON" });
  }

  if (!isVenueRequest(body)) {
    return jsonError(400, "Expected coupleId", { code: "INVALID_BODY" });
  }

  const payload: VenueRecommendationResponse = {
    venues: [],
    generated_at: new Date().toISOString(),
  };
  return Response.json(payload);
}
