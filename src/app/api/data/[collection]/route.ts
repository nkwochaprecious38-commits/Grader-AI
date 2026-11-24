import { api, body, json, HttpError } from "@/lib/http";
import { tx, read, col, uid, now, audit } from "@/lib/store";
import { policy, clean } from "@/lib/policy";

export const GET = api(async (_r, { params }, s) => {
  const name = (await params).collection; const p = policy(name);
  if (!p.read.includes(s!.role)) throw new HttpError(403, "Your role does not have access to this data.");
  const rows = await read((db) => col(db, name).filter((r) => r.orgId === s!.org.id));
  return json(rows);
});

export const POST = api(async (req, { params }, s) => {
  const name = (await params).collection; const p = policy(name);
  if (!p.write.includes(s!.role)) throw new HttpError(403, "Your role cannot create this record.");
  const data = clean(await body(req));
  if (p.required && !String(data[p.required] ?? "").trim()) throw new HttpError(400, `${p.required[0].toUpperCase() + p.required.slice(1)} is required.`);
  const rec = await tx((db) => {
    const r = { ...data, id: uid(name[0] + "_"), orgId: s!.org.id, createdAt: now(), createdBy: s!.user.id };
    col(db, name).push(r);
    audit(db, s!.org.id, s!.user, `${name}.created`, { id: r.id, title: r.title || r.name });
    return r;
  });
  return json(rec, 201);
});
