import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { BUDGET_RANGES, GUEST_COUNT_RANGES, PRIORITY_CATEGORIES } from "@/lib/constants";
import type { BuddyChatMode } from "@/types/api";
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

/** Alias for route imports per product spec */
export const AI_TOOLS: Tool[] = [
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

export const aiBuddyTools = AI_TOOLS;

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

export function buildBuddyModeSystemSuffix(
  mode: BuddyChatMode,
  partner1Name: string,
  partner2Name: string,
): string {
  const signOff = `${partner1Name} & ${partner2Name}`;
  switch (mode) {
    case "vendor_email":
      return `

You are helping draft a professional vendor inquiry email.
The couple's wedding details are above.

When drafting emails:
- Address the vendor professionally but warmly
- Include: wedding date, location, guest count, and style/vibe
- Ask 3–5 specific, smart questions a planner would ask (availability, pricing structure, what's included, experience with similar weddings, next steps)
- Keep it under 200 words
- Do not include a subject line unless asked
- Sign off as '${signOff}'

After drafting, ask if they want to adjust the tone, add specific questions, or get a subject line.`;
    case "vision_board":
      return `

You are helping a couple articulate the visual direction of their wedding for their vendors.

When a couple describes a vision, respond with:

1. MOOD TITLE: A 3–5 word evocative name for the aesthetic
   (e.g. 'Gilded Tuscan Harvest', 'Coastal Nordic Minimal')

2. PALETTE: 4–5 specific colors with names and hex codes
   (e.g. 'Aged Champagne #C9A96E')

3. ATMOSPHERE: 2–3 sentences describing the feeling of the space — light, texture, temperature, sound

4. KEY ELEMENTS: 6–8 specific visual details
   (e.g. 'Tapered ivory candles in clusters of 3',
   'Linen tablecloths with raw unhemmed edges',
   'Foraged greenery in terracotta vessels')

5. VENDOR DIRECTION: One sentence each telling the florist, photographer, and venue/caterer what to prioritize

6. WHAT TO AVOID: 3 specific things that would break this aesthetic

Format your response with these exact section headers.
After delivering the concept, ask if they want to adjust the direction, go bolder/softer, or generate a version for a specific vendor.`;
    case "timeline":
      return `

You are building a detailed wedding day-of timeline.
Use the couple's profile above for context.

When building a timeline:
- Work backwards from ceremony start for getting ready
- Standard getting ready time: 3–4 hours for bridal party
- Include buffer time between every transition (15–30 min)
- Include: wake up, breakfast, hair & makeup start/finish,
  photographer arrival, first look (if applicable),
  wedding party portraits, family formals,
  guest arrival, ceremony start/end,
  cocktail hour, reception doors open,
  grand entrance, first dance, parent dances,
  dinner service, toasts, cake cutting,
  open dancing, last dance, send-off,
  vendor load-out
- Note which vendors need to be where at each time
- Flag any timing that seems too tight

Format as a clean timeline with exact times, event name, and a brief note for each item.
After delivering, ask what they want to adjust.`;
    default:
      return "";
  }
}

/** Short opening line when the buddy reconnects; null if nothing notable. */
export function buildProactiveNudge(ctx: WeddingContext): string | null {
  const { checklistSummary, budgetSummary, vendorSummary, profile } = ctx;
  const days =
    profile.wedding_date != null
      ? (() => {
          const [y, m, d] = profile.wedding_date.split("-").map(Number);
          if (!y || !m || !d) return null;
          const target = new Date(y, m - 1, d);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          target.setHours(0, 0, 0, 0);
          return Math.round((target.getTime() - today.getTime()) / 86_400_000);
        })()
      : null;

  if (checklistSummary.overdueCount > 0) {
    return `You have ${checklistSummary.overdueCount} overdue checklist task${checklistSummary.overdueCount === 1 ? "" : "s"} — want help prioritizing what to tackle first?`;
  }

  if (budgetSummary.overBudgetCategories.length > 0) {
    const c = budgetSummary.overBudgetCategories.slice(0, 2).join(", ");
    return `A few budget lines are running over estimate (${c}). I can help you rebalance or flag what to revisit with vendors.`;
  }

  if (
    vendorSummary.notYetBooked.length > 0 &&
    days !== null &&
    days <= 180 &&
    days > 0
  ) {
    return `With about ${days} days to go, you still have key vendors open (${vendorSummary.notYetBooked.slice(0, 3).join(", ")}). Want a focused booking order?`;
  }

  if (checklistSummary.completed > 0 && checklistSummary.total > 0) {
    const pct = Math.round((checklistSummary.completed / checklistSummary.total) * 100);
    if (pct >= 60 && pct < 100) {
      return `You're past ${pct}% on your checklist — nice momentum. I can suggest the highest-impact tasks for the stretch ahead.`;
    }
  }

  return null;
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
