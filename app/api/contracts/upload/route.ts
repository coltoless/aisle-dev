import { NextRequest } from "next/server";
import { jsonError } from "@/lib/api/responses";

/**
 * Multipart upload: file + JSON fields matching ContractUploadRequest.
 * Stub validates presence of coupleId + vendorName only.
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return jsonError(400, "Expected multipart/form-data", { code: "INVALID_CONTENT_TYPE" });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError(400, "Invalid form data", { code: "INVALID_FORM" });
  }

  const coupleId = form.get("coupleId");
  const vendorName = form.get("vendorName");
  if (typeof coupleId !== "string" || coupleId.trim() === "") {
    return jsonError(400, "coupleId is required", { code: "INVALID_BODY" });
  }
  if (typeof vendorName !== "string" || vendorName.trim() === "") {
    return jsonError(400, "vendorName is required", { code: "INVALID_BODY" });
  }

  return jsonError(501, "Contract upload not implemented yet", {
    code: "NOT_IMPLEMENTED",
  });
}
