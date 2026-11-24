import { api, json } from "@/lib/http";
import { clearSession } from "@/lib/auth";
export const POST = api(async () => { await clearSession(); return json({ ok: true }); }, { auth: false });
