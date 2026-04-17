import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { jsonError } from "@/lib/api/responses";
import {
  AI_TOOLS,
  buildBuddyModeSystemSuffix,
  buildBuddySystemPrompt,
  buildWeddingContextBlock,
} from "@/lib/ai/prompts";
import { fetchWeddingContextForBuddy, normalizeChecklistCategory, normalizeChecklistPhase } from "@/lib/ai/buddy-context";
import { createClient } from "@/lib/supabase/server";
import type { BuddyChatMode, BuddyRequest, BuddyStreamDoneEvent, BuddyToolAction } from "@/types/api";
import type { AppDatabase } from "@/types/database-app";
import type { ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";

function isBuddyRequest(body: unknown): body is BuddyRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  if (typeof b.coupleId !== "string" || b.coupleId.trim() === "") return false;
  if (!Array.isArray(b.messages)) return false;
  const modeOk =
    b.mode === "planning" ||
    b.mode === "vendor_email" ||
    b.mode === "vision_board" ||
    b.mode === "timeline";
  if (!modeOk) return false;
  return b.messages.every((m) => {
    if (typeof m !== "object" || m === null) return false;
    const msg = m as { role?: unknown; content?: unknown };
    if (msg.role !== "user" && msg.role !== "assistant") return false;
    return typeof msg.content === "string";
  });
}

function lastUserContent(messages: BuddyRequest["messages"]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]!.role === "user") return messages[i]!.content;
  }
  return null;
}

async function executeBuddyTool(
  supabase: SupabaseClient<AppDatabase>,
  coupleId: string,
  block: ToolUseBlock,
): Promise<BuddyToolAction> {
  const input = block.input as Record<string, unknown>;
  const name = block.name;

  if (name === "add_checklist_item") {
    const title = String(input.title ?? "").trim();
    const category = normalizeChecklistCategory(String(input.category ?? "vendors"));
    const phase = normalizeChecklistPhase(String(input.phase ?? "6_9_months"));
    const due_date = input.due_date != null ? String(input.due_date).trim() || null : null;
    const notes = input.notes != null ? String(input.notes).trim() || null : null;

    if (!title) {
      return {
        tool: "add_checklist_item",
        success: false,
        confirmationMessage: "Could not add checklist item (missing title).",
        input,
      };
    }

    const { data: maxRow } = await supabase
      .from("checklist_items")
      .select("sort_order")
      .eq("couple_id", coupleId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSort = (maxRow?.sort_order ?? 0) + 1;

    const { data: inserted, error } = await supabase
      .from("checklist_items")
      .insert({
        couple_id: coupleId,
        title,
        category,
        phase,
        due_date,
        notes,
        is_custom: false,
        sort_order: nextSort,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      return {
        tool: "add_checklist_item",
        success: false,
        confirmationMessage: error?.message ?? "Failed to add checklist item.",
        input,
      };
    }

    return {
      tool: "add_checklist_item",
      success: true,
      confirmationMessage: `Added to checklist: ${title}`,
      input,
      checklistItemId: inserted.id,
    };
  }

  if (name === "flag_budget_item") {
    const category = String(input.category ?? "").trim();
    const reason = String(input.reason ?? "").trim();
    const severity = input.severity === "info" || input.severity === "warning" || input.severity === "critical"
      ? input.severity
      : "warning";

    if (!category || !reason) {
      return {
        tool: "flag_budget_item",
        success: false,
        confirmationMessage: "Could not flag budget (missing category or reason).",
        input,
      };
    }

    const { data: inserted, error } = await supabase
      .from("budget_flags")
      .insert({
        couple_id: coupleId,
        category,
        reason,
        severity,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      return {
        tool: "flag_budget_item",
        success: false,
        confirmationMessage: error?.message ?? "Failed to flag budget.",
        input,
      };
    }

    return {
      tool: "flag_budget_item",
      success: true,
      confirmationMessage: `Flagged: ${category} budget`,
      input,
      budgetFlagId: inserted.id,
    };
  }

  if (name === "recommend_venues") {
    return {
      tool: "recommend_venues",
      success: true,
      confirmationMessage: "Opening venue recommendations",
      input,
      navigateTo: "/venues",
    };
  }

  return {
    tool: "recommend_venues",
    success: false,
    confirmationMessage: `Unknown tool: ${name}`,
    input,
  };
}

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return jsonError(503, "ANTHROPIC_API_KEY is not configured", {
      code: "SERVICE_UNAVAILABLE",
    });
  }

  const supabase = (await createClient()) as unknown as SupabaseClient<AppDatabase>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError(401, "Unauthorized", { code: "UNAUTHORIZED" });
  }

  const { data: couple, error: coupleErr } = await supabase
    .from("couples")
    .select("id, partner1_name, partner2_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (coupleErr || !couple) {
    return jsonError(401, "No couple record", { code: "UNAUTHORIZED" });
  }

  const coupleRow = couple as { id: string; partner1_name: string; partner2_name: string };

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON", { code: "INVALID_JSON" });
  }

  if (!isBuddyRequest(body)) {
    return jsonError(400, "Expected coupleId, mode, and messages[] with role and content", {
      code: "INVALID_BODY",
    });
  }

  const { messages, coupleId, mode } = body;

  if (coupleId !== coupleRow.id) {
    return jsonError(403, "Couple mismatch", { code: "FORBIDDEN" });
  }

  const ctx = await fetchWeddingContextForBuddy(supabase, coupleId, coupleRow.partner1_name, coupleRow.partner2_name);

  if (!ctx) {
    return jsonError(400, "Wedding profile not found", { code: "NO_PROFILE" });
  }

  const contextBlock = buildWeddingContextBlock(ctx);
  const modeSuffix = buildBuddyModeSystemSuffix(
    mode as BuddyChatMode,
    coupleRow.partner1_name,
    coupleRow.partner2_name,
  );
  const system = buildBuddySystemPrompt(contextBlock) + modeSuffix;

  const toolsForMode = mode === "planning" ? AI_TOOLS : [];

  const client = new Anthropic({ apiKey: key });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const write = (obj: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
      };

      let assistantText = "";
      const toolActions: BuddyToolAction[] = [];
      let toolChain: Promise<void> = Promise.resolve();
      let streamError: Error | null = null;

      const stream = client.messages.stream({
        model,
        max_tokens: 1024,
        system,
        ...(toolsForMode.length ? { tools: toolsForMode } : {}),
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      stream.on("text", (delta: string) => {
        assistantText += delta;
        write({ type: "text", text: delta });
      });

      stream.on("contentBlock", (block) => {
        if (block.type !== "tool_use") return;
        toolChain = toolChain.then(async () => {
          try {
            const action = await executeBuddyTool(supabase, coupleRow.id, block as ToolUseBlock);
            toolActions.push(action);
            write({ type: "tool_action", action });
          } catch (e) {
            const action: BuddyToolAction = {
              tool: "add_checklist_item",
              success: false,
              confirmationMessage: e instanceof Error ? e.message : "Tool failed",
              input: {},
            };
            toolActions.push(action);
            write({ type: "tool_action", action });
          }
        });
      });

      stream.on("error", (err: Error) => {
        streamError = err;
      });

      try {
        await stream.done();
      } catch (e) {
        streamError = e instanceof Error ? e : new Error(String(e));
      }

      await toolChain;

      if (streamError) {
        const fallback =
          "\n\nI hit a brief snag connecting to the assistant. Please try again in a moment.";
        assistantText += fallback;
        write({ type: "text", text: fallback });
      }

      const done: BuddyStreamDoneEvent = { type: "done", toolActions };
      write(done);

      const userContent = lastUserContent(messages);
      if (userContent && assistantText.trim()) {
        const modeStr = mode;
        const rows: AppDatabase["public"]["Tables"]["ai_conversations"]["Insert"][] = [
          { couple_id: coupleId, role: "user", content: userContent, mode: modeStr },
          { couple_id: coupleId, role: "assistant", content: assistantText.trim(), mode: modeStr },
        ];
        await supabase.from("ai_conversations").insert(rows);
      }

      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
