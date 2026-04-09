import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { BUDGET_RANGES, GUEST_COUNT_RANGES, PRIORITY_CATEGORIES } from "@/lib/constants";
import type { WeddingProfile } from "@/types";

export interface WeddingContext {
  partner1Name: string;
  partner2Name: string;
  profile: WeddingProfile;
  checklistSummary: {
    total: number;
    completed: number;
    overdueCount: number;
    upcomingTasks: { title: string; dueDate: string | null }[];
  };
  budgetSummary: {
    totalBudgetCents: number;
    totalAllocatedCents: number;
    totalSpentCents: number;
    overBudgetCategories: string[];
  };
  vendorSummary: {
    booked: string[];
    notYetBooked: string[];
  };
}

export const aiBuddyTools: Tool[] = [
  {
    name: "add_checklist_item",
    description:
      "Add a planning task to the couple's checklist when they agree or you recommend a concrete next step.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short task title" },
        category: { type: "string" },
        phase: { type: "string", description: "Checklist phase id, e.g. 6_9_months" },
        due_date: { type: "string", description: "Optional ISO date" },
        notes: { type: "string" },
      },
      required: ["title", "category", "phase"],
    },
  },
  {
    name: "flag_budget_item",
    description:
      "Flag a budget category when quotes or spending suggest the couple may exceed their plan.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string" },
        reason: { type: "string" },
        severity: {
          type: "string",
          enum: ["info", "warning", "critical"],
        },
      },
      required: ["category", "reason", "severity"],
    },
  },
  {
    name: "recommend_venues",
    description:
      "Trigger curated venue recommendations based on the couple's profile and optional notes.",
    input_schema: {
      type: "object",
      properties: {
        notes: { type: "string", description: "Optional focus (style, region, capacity)" },
      },
      required: [],
    },
  },
];

export function buildWeddingContextBlock(ctx: WeddingContext): string {
  const p = ctx.profile;
  const loc = [p.location_city, p.location_state, p.location_country]
    .filter(Boolean)
    .join(", ");
  return [
    `Partners: ${ctx.partner1Name} & ${ctx.partner2Name}`,
    `Wedding date: ${p.wedding_date ?? "TBD"}`,
    `Location: ${loc || "TBD"}`,
    `Guest range: ${p.guest_count_range ?? "unknown"}`,
    `Budget range: ${p.budget_range ?? "unknown"}`,
    `Styles: ${(p.style_tags ?? []).join(", ") || "none listed"}`,
    `Priorities (ordered): ${(p.priorities ?? []).join(", ") || "none listed"}`,
    `Checklist: ${ctx.checklistSummary.completed}/${ctx.checklistSummary.total} done, ${ctx.checklistSummary.overdueCount} overdue`,
    `Upcoming: ${ctx.checklistSummary.upcomingTasks.map((t) => t.title).join("; ") || "none"}`,
    `Budget (cents): total ${ctx.budgetSummary.totalBudgetCents}, allocated ${ctx.budgetSummary.totalAllocatedCents}, spent ${ctx.budgetSummary.totalSpentCents}`,
    `Over-budget categories: ${ctx.budgetSummary.overBudgetCategories.join(", ") || "none"}`,
    `Vendors booked: ${ctx.vendorSummary.booked.join(", ") || "none"}`,
    `Vendors not booked: ${ctx.vendorSummary.notYetBooked.join(", ")}`,
  ].join("\n");
}

export function buildBuddySystemPrompt(contextBlock: string): string {
  return `You are Aisle, a warm, practical wedding planning assistant. You speak in short, clear paragraphs. You reference the couple's real data below. When you commit to adding a task, flagging budget, or refreshing venues, use the provided tools.

WEDDING CONTEXT:
${contextBlock}

Rules:
- Be supportive and specific; avoid generic platitudes.
- Prefer actionable checklists and timelines.
- Never claim legal advice; suggest professionals for contracts and disputes.
- If unsure, ask one clarifying question instead of guessing.`;
}

export function buildOnboardingIntroPrompt(params: {
  partner1Name: string;
  partner2Name: string;
  locationLabel: string;
  weddingDateLabel: string;
  topPriorityLabel: string;
}): string {
  return `Write a 2–3 sentence welcome for ${params.partner1Name} and ${params.partner2Name}. Mention ${params.locationLabel} and ${params.weddingDateLabel}. Close with one concrete next step tied to their top priority: ${params.topPriorityLabel}. Tone: warm, confident, not cheesy.`;
}

/** User message content for Claude onboarding intro (short, warm paragraph). */
export function buildOnboardingIntroMessage(input: {
  partner1Name: string;
  partner2Name: string;
  weddingDate: string | null;
  location: string;
  guestCountRange: string;
  budgetRange: string;
  styleTags: string[];
  topPriorities: string[];
}): string {
  const guestLabel =
    GUEST_COUNT_RANGES.find((g) => g.id === input.guestCountRange)?.label ?? input.guestCountRange;
  const budgetLabel =
    BUDGET_RANGES.find((b) => b.id === input.budgetRange)?.label ?? input.budgetRange;
  const dateLabel = input.weddingDate
    ? `Wedding date: ${input.weddingDate}.`
    : "They have not set a firm date yet.";
  const styles = input.styleTags.length ? input.styleTags.join(", ") : "still taking shape";
  const topLabels = input.topPriorities.map(
    (id) => PRIORITY_CATEGORIES.find((p) => p.id === id)?.label ?? id,
  );
  const tops = topLabels.length ? topLabels.join(", ") : "venue and planning basics";

  return [
    `Write exactly one short paragraph (2–4 sentences) as Aisle, welcoming ${input.partner1Name} and ${input.partner2Name}.`,
    `${dateLabel} Location focus: ${input.location}.`,
    `Guest count band: ${guestLabel}. Budget band: ${budgetLabel}. Wedding vibe tags: ${styles}.`,
    `Their top priorities in order: ${tops}.`,
    `End with one specific, practical next step. Warm, calm, confident — no exclamation spam, no clichés about fairy tales.`,
    `Output plain text only, no title or bullet points.`,
  ].join(" ");
}
