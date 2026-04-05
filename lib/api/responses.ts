import { NextResponse } from "next/server";
import type { ApiError } from "@/types/api";

export function jsonError(
  status: number,
  message: string,
  options?: { code?: string; details?: unknown },
): NextResponse<ApiError> {
  const body: ApiError = {
    error: message,
    ...(options?.code !== undefined && { code: options.code }),
    ...(options?.details !== undefined && { details: options.details }),
  };
  return NextResponse.json(body, { status });
}
