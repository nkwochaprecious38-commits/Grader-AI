// Removes everything created by scripts/e2e.mjs (users with @gai-e2e.example.com and the workspaces they own).
import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, key, { auth: { persistSession: false }, db: { schema: "grader_ai" } });
const { data: profiles } = await sb.from("profiles").select("id,email").ilike("email", "%@gai-e2e.example.com");
const ids = (profiles || []).map((p) => p.id);
const { data: ms } = ids.length ? await sb.from("memberships").select("org_id,role,user_id").in("user_id", ids) : { data: [] };
const orgIds = [...new Set((ms || []).filter((m) => m.role === "org_admin").map((m) => m.org_id))];
if (orgIds.length) await sb.from("organizations").delete().in("id", orgIds); // cascades records, memberships, invites
for (const id of ids) { await sb.from("profiles").delete().eq("id", id); await sb.auth.admin.deleteUser(id); }
const { data: files } = await sb.storage.from("grader-ai-submissions").list("", { limit: 1000 });
console.log(`removed ${ids.length} test users and ${orgIds.length} workspaces; ${files?.length ?? 0} files left in bucket (uploads from tests are small and listed for manual review)`);
