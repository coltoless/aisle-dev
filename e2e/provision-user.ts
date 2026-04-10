import { createClient } from "@supabase/supabase-js";

/**
 * When Supabase requires email confirmation, password signup returns no session.
 * If `SUPABASE_SERVICE_ROLE_KEY` is present (from `.env.local`), create a confirmed user
 * so the browser can log in and run onboarding like a new account.
 */
export async function provisionConfirmedUser(email: string, password: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (!error) return true;
  if (/already|exists|registered/i.test(error.message)) return true;
  console.warn("[e2e] auth.admin.createUser:", error.message);
  return false;
}
