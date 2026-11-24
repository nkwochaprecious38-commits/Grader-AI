import { z } from "zod";
import { api, body, json } from "@/lib/http";
import { tx, col, audit } from "@/lib/store";
import { ADMINS } from "@/lib/roles";

export const PATCH = api(async (req, _c, s) => {
  const d = z.object({ name: z.string().trim().min(2).max(120) }).parse(await body(req));
  await tx((db) => { db.orgs.find((o) => o.id === s!.org.id)!.name = d.name; audit(db, s!.org.id, s!.user, "workspace.renamed", d); });
  return json({ ok: true });
}, { roles: ["org_admin"] });

/** Removes every record flagged as demonstration data. */
export const DELETE = api(async (_r, _c, s) => {
  const n = await tx((db) => {
    let n = 0;
    for (const k of Object.keys(db.data)) { const keep = db.data[k].filter((r) => !(r.orgId === s!.org.id && r.demo)); n += db.data[k].length - keep.length; db.data[k] = keep; }
    db.orgs.find((o) => o.id === s!.org.id)!.demo = false;
    audit(db, s!.org.id, s!.user, "workspace.demo_removed", { removed: n });
    return n;
  });
  return json({ ok: true, removed: n });
}, { roles: ADMINS });
