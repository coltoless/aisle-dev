import type { Database } from "@/types/supabase";

/** Supabase client schema: omit CLI-only `__InternalSupabase` so `.from()` row types infer correctly. */
export type AppDatabase = Omit<Database, "__InternalSupabase">;
