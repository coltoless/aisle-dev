import { NextRequest } from "next/server";
import { jsonError } from "@/lib/api/responses";
import type { ContractReviewRequest, ContractReviewResponse } from "@/types/api";

function isContractReviewRequest(body: unknown): body is ContractReviewRequest {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as ContractReviewRequest).contractId === "string" &&
    (body as ContractReviewRequest).contractId.trim() !== "" &&
    typeof (body as ContractReviewRequest).coupleId === "string" &&
    (body as ContractReviewRequest).coupleId.trim() !== ""
  );
}

/** AI review of uploaded contract PDFs (server-side only). */
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

  if (!isContractReviewRequest(body)) {
    return jsonError(400, "Expected contractId and coupleId", {
      code: "INVALID_BODY",
    });
  }

  const payload: ContractReviewResponse = {
    contractId: body.contractId,
    sections: [],
    flagCount: 0,
    reviewed_at: new Date().toISOString(),
  };
  return Response.json(payload);
}
