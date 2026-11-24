import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const BUCKET = "grader-ai-submissions";
function env(k: string) { const v = process.env[k]; if (!v) throw new Error(`${k} is not set. See .env.example.`); return v; }
let _admin: SupabaseClient<any, any, any> | null = null;
/** Service role client scoped to the grader_ai schema. Server only: never import from client components. */
export const admin = (): SupabaseClient<any, any, any> => (_admin ||= createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false, autoRefreshToken: false }, db: { schema: "grader_ai" } }));
/** Anon client used only to verify passwords through Supabase Auth. Never persists a session. */
export const anon = () => createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), { auth: { persistSession: false, autoRefreshToken: false } });
