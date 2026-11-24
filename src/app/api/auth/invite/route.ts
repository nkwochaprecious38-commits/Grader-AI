import { api, json } from "@/lib/http";
import { read } from "@/lib/store";
export const GET = api(async (req) => {
  const t = new URL(req.url).searchParams.get("token") || "";
  const r = await read((db) => {
    const i = db.invites.find((x) => x.token === t && !x.used && new Date(x.expires) > new Date());
    if (!i) return null;
    return { email: i.email, role: i.role, org: db.orgs.find((o) => o.id === i.orgId)?.name };
  });
  return r ? json(r) : json({ error: "This invitation is invalid or has expired." }, 404);
}, { auth: false });
