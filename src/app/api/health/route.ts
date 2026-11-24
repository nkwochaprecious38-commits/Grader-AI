import { NextResponse } from "next/server";
import { admin, anon } from "@/lib/supa";

export const dynamic = "force-dynamic";
const VARS = ["SESSION_SECRET", "APP_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];

/** Setup check. Reports only whether each variable is present, never its value. */
export async function GET() {
  const env = Object.fromEntries(VARS.map((v) => [v, !!process.env[v]]));
  const out: any = { env, database: "skipped", auth: "skipped", storage: "skipped" };
  const short = (m: string) => m.replace(/eyJ[\w.-]+|sb_[\w-]+/g, "[key]").slice(0, 160);
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try { const r = await admin().from("records").select("id").limit(1); out.database = r.error ? "error: " + short(r.error.message) : "ok"; } catch (e: any) { out.database = "error: " + short(e.message); }
    try { const r = await admin().auth.admin.listUsers({ page: 1, perPage: 1 }); out.auth = r.error ? "error: " + short(r.error.message) : "ok"; } catch (e: any) { out.auth = "error: " + short(e.message); }
    try { const r = await admin().storage.getBucket("grader-ai-submissions"); out.storage = r.error ? "error: " + short(r.error.message) : "ok"; } catch (e: any) { out.storage = "error: " + short(e.message); }
  }
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    try { const r = await anon().auth.getSession(); out.anonKey = r.error ? "error" : "ok"; } catch { out.anonKey = "error"; }
  }
  out.ready = Object.values(env).every(Boolean) && out.database === "ok" && out.auth === "ok" && out.storage === "ok";
  return NextResponse.json(out, { status: out.ready ? 200 : 503 });
}
