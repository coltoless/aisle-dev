import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { jsonError } from "@/lib/api/responses";
import {
  aiBuddyTools,
  buildBuddySystemPrompt,
  buildWeddingContextBlock,
  type WeddingContext,
} from "@/lib/ai/prompts";
import type { BuddyRequest, BuddyStreamDoneEvent } from "@/types/api";
import type { WeddingProfile } from "@/types";

function stubWeddingProfile(): WeddingProfile {
  return {
    id: "00000000-0000-4000-8000-000000000000",
    couple_id: "00000000-0000-4000-8000-000000000001",
    wedding_date: null,
    location_city: null,
    location_state: null,
    location_country: "US",
    guest_count_range: null,
    budget_range: null,
    budget_exact: null,
    style_tags: null,
    priorities: null,
    onboarding_complete: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function stubWeddingContext(): WeddingContext {
  return {
    partner1Name: "Partner 1",
    partner2Name: "Partner 2",
    profile: stubWeddingProfile(),
    checklistSummary: {
      total: 0,
      completed: 0,
      overdueCount: 0,
      upcomingTasks: [],
    },
    budgetSummary: {
      totalBudgetCents: 0,
      totalAllocatedCents: 0,
      totalSpentCents: 0,
      overBudgetCategories: [],
    },
    vendorSummary: {
      booked: [],
      notYetBooked: ["venue", "photographer", "caterer", "florist"],
    },
  };
}

/**
 * Streaming AI buddy. Sends Anthropic messages with tools; persists turns via Supabase (TODO).
 */
function isBuddyRequest(body: unknown): body is BuddyRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  if (typeof b.coupleId !== "string" || b.coupleId.trim() === "") return false;
  if (!Array.isArray(b.messages)) return false;
  return b.messages.every((m) => {
    if (typeof m !== "object" || m === null) return false;
    const msg = m as { role?: unknown; content?: unknown };
    if (msg.role !== "user" && msg.role !== "assistant") return false;
    return typeof msg.content === "string";
  });
}

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
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

  if (!isBuddyRequest(body)) {
    return jsonError(400, "Expected coupleId and messages[] with role and content", {
      code: "INVALID_BODY",
    });
  }

  const { messages, coupleId: _coupleId } = body;
  void _coupleId; // TODO: fetch WeddingContext by coupleId (Supabase)
  const contextBlock = buildWeddingContextBlock(stubWeddingContext());
  const system = buildBuddySystemPrompt(contextBlock);

  const client = new Anthropic({ apiKey: key });

  const model =
    process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022";

  const stream = await client.messages.stream({
    model,
    max_tokens: 4096,
    system,
    tools: aiBuddyTools,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        }
        const done: BuddyStreamDoneEvent = { type: "done", toolActions: [] };
        controller.enqueue(encoder.encode(JSON.stringify(done) + "\n"));
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
