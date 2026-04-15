import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SeedResult = {
  userId: string;
  coupleId: string;
};

async function getUserIdByEmail(admin: SupabaseClient, email: string): Promise<string> {
  // Supabase JS admin API doesn't expose a direct "get user by email" in all versions,
  // so we list and filter. This is only used in local/dev e2e.
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`[e2e] listUsers failed: ${error.message}`);
  const match = data.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
  if (!match?.id) throw new Error(`[e2e] Could not find user for email: ${email}`);
  return match.id;
}

export async function seedDashboardDataForEmail(email: string): Promise<SeedResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "[e2e] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY; can't seed dashboard data.",
    );
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const userId = await getUserIdByEmail(admin, email);

  const { data: couple, error: coupleErr } = await admin
    .from("couples")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (coupleErr) throw new Error(`[e2e] couples select failed: ${coupleErr.message}`);
  if (!couple?.id) throw new Error("[e2e] No couple row found for user; onboarding likely didn't complete.");
  const coupleId = couple.id as string;

  const { data: checklistExisting, error: checklistErr } = await admin
    .from("checklist_items")
    .select("id")
    .eq("couple_id", coupleId)
    .limit(1);
  if (checklistErr) throw new Error(`[e2e] checklist_items select failed: ${checklistErr.message}`);

  const { data: budgetExisting, error: budgetErr } = await admin
    .from("budget_items")
    .select("id")
    .eq("couple_id", coupleId)
    .limit(1);
  if (budgetErr) throw new Error(`[e2e] budget_items select failed: ${budgetErr.message}`);

  const { data: vendorExisting, error: vendorErr } = await admin
    .from("vendors")
    .select("id")
    .eq("couple_id", coupleId)
    .limit(1);
  if (vendorErr) throw new Error(`[e2e] vendors select failed: ${vendorErr.message}`);

  if ((checklistExisting?.length ?? 0) === 0) {
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const overdue = new Date(today);
    overdue.setDate(today.getDate() - 2);
    const soon = new Date(today);
    soon.setDate(today.getDate() + 3);

    const { error } = await admin.from("checklist_items").insert([
      {
        couple_id: coupleId,
        title: "E2E: Tour 3 venues",
        category: "venue",
        phase: "9_12_months",
        due_date: iso(soon),
        completed: false,
        sort_order: 1,
        is_custom: true,
      },
      {
        couple_id: coupleId,
        title: "E2E: Shortlist photographers",
        category: "vendors",
        phase: "9_12_months",
        due_date: iso(soon),
        completed: false,
        sort_order: 2,
        is_custom: true,
      },
      {
        couple_id: coupleId,
        title: "E2E: Start guest list",
        category: "guests",
        phase: "9_12_months",
        due_date: iso(overdue),
        completed: false,
        sort_order: 3,
        is_custom: true,
      },
    ]);
    if (error) throw new Error(`[e2e] checklist_items insert failed: ${error.message}`);
  }

  if ((budgetExisting?.length ?? 0) === 0) {
    const { error } = await admin.from("budget_items").insert([
      {
        couple_id: coupleId,
        category: "venue",
        category_label: "Venue",
        estimated_cost: 900000, // $9,000
        quoted_cost: 850000,
        deposit_paid: 250000,
        balance_due: 600000,
        sort_order: 1,
      },
      {
        couple_id: coupleId,
        category: "photography",
        category_label: "Photography",
        estimated_cost: 400000, // $4,000
        quoted_cost: 380000,
        deposit_paid: 100000,
        balance_due: 280000,
        sort_order: 2,
      },
      {
        couple_id: coupleId,
        category: "catering",
        category_label: "Catering",
        estimated_cost: 700000, // $7,000
        quoted_cost: 0,
        deposit_paid: 150000,
        balance_due: 550000,
        sort_order: 3,
      },
    ]);
    if (error) throw new Error(`[e2e] budget_items insert failed: ${error.message}`);
  } else {
    // Onboarding may seed budget rows with estimates but no committed amounts.
    // Ensure at least one row has a non-zero committed value so the dashboard stat is real.
    const { data: existingRows, error: committedErr } = await admin
      .from("budget_items")
      .select("id, quoted_cost, deposit_paid")
      .eq("couple_id", coupleId);
    if (committedErr) throw new Error(`[e2e] budget_items select (committed) failed: ${committedErr.message}`);
    const hasCommitted = (existingRows ?? []).some((r) => (r.quoted_cost ?? 0) > 0 || (r.deposit_paid ?? 0) > 0);
    if (!hasCommitted) {
      const { error } = await admin.from("budget_items").insert([
        {
          couple_id: coupleId,
          category: "e2e_misc",
          category_label: "E2E Misc",
          estimated_cost: 123400, // $1,234
          quoted_cost: 123400, // committed should read non-zero
          deposit_paid: 0,
          balance_due: 0,
          sort_order: 999,
        },
      ]);
      if (error) throw new Error(`[e2e] budget_items insert (committed fallback) failed: ${error.message}`);
    }
  }

  if ((vendorExisting?.length ?? 0) === 0) {
    const { error } = await admin.from("vendors").insert([
      {
        couple_id: coupleId,
        category: "venue",
        company_name: "E2E Venue Co",
        status: "researching",
      },
      {
        couple_id: coupleId,
        category: "photography",
        company_name: "E2E Photo Studio",
        status: "contacted",
      },
    ]);
    if (error) throw new Error(`[e2e] vendors insert failed: ${error.message}`);
  }

  return { userId, coupleId };
}

