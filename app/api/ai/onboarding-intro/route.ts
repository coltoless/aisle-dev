import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { buildOnboardingIntroMessage } from "@/lib/ai/prompts";
import { jsonError, jsonOk } from "@/lib/api/responses";
import { createClient } from "@/lib/supabase/server";

const FALLBACK =
  "Welcome! Your checklist and budget are ready. I'm here whenever you have a question.";

type IntroBody = {
  partner1Name?: string;
  partner2Name?: string;
  weddingDate?: string | null;
  location?: string;
  guestCountRange?: string;
  budgetRange?: string;
  styleTags?: string[];
  topPriorities?: string[];
};

function isValidIntroBody(body: unknown): body is Required<Omit<IntroBody, "weddingDate">> & {
  weddingDate: string | null;
} {
  if (typeof body !== "object" || body === null) return false;
  const b = body as IntroBody;
  if (typeof b.partner1Name !== "string" || !b.partner1Name.trim()) return false;
  if (typeof b.partner2Name !== "string" || !b.partner2Name.trim()) return false;
  if (b.weddingDate !== null && b.weddingDate !== undefined && typeof b.weddingDate !== "string")
    return false;
  if (typeof b.location !== "string" || !b.location.trim()) return false;
  if (typeof b.guestCountRange !== "string") return false;
  if (typeof b.budgetRange !== "string") return false;
  if (!Array.isArray(b.styleTags) || !b.styleTags.every((t) => typeof t === "string")) return false;
  if (!Array.isArray(b.topPriorities) || !b.topPriorities.every((t) => typeof t === "string"))
    return false;
  return true;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError(401, "Unauthorized", { code: "UNAUTHORIZED" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON", { code: "INVALID_JSON" });
  }

  if (!isValidIntroBody(body)) {
    return jsonError(400, "Invalid request body", { code: "INVALID_BODY" });
  }

  const weddingDate = body.weddingDate === undefined ? null : body.weddingDate;

  const userContent = buildOnboardingIntroMessage({
    partner1Name: body.partner1Name.trim(),
    partner2Name: body.partner2Name.trim(),
    weddingDate,
    location: body.location.trim(),
    guestCountRange: body.guestCountRange,
    budgetRange: body.budgetRange,
    styleTags: body.styleTags,
    topPriorities: body.topPriorities,
  });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonOk({ message: FALLBACK });
  }

  try {
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_ONBOARDING_MODEL ?? "claude-sonnet-4-5";
    const msg = await client.messages.create({
      model,
      max_tokens: 300,
      system:
        "You are Aisle, a calm and capable wedding planning companion. Follow the user's instructions exactly. Output only the welcome text they asked for.",
      messages: [{ role: "user", content: userContent }],
    });

    const block = msg.content[0];
    const text = block && block.type === "text" ? block.text.trim() : "";
    return jsonOk({ message: text || FALLBACK });
  } catch {
    return jsonOk({ message: FALLBACK });
  }
}
