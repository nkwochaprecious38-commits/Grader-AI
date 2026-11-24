import { z } from "zod";
import crypto from "crypto";
import { api, body, json, HttpError } from "@/lib/http";
import { tx, read, col, uid, now, audit } from "@/lib/store";
import { ADMINS } from "@/lib/roles";
import { email } from "@/lib/validators";
import { appUrl, mailConfigured, sendMail } from "@/lib/mail";

export const GET = api(async (_r, _c, s) => json(await read((db) => ({
  members: db.memberships.filter((m) => m.orgId === s!.org.id).map((m) => { const u = db.users.find((x) => x.id === m.userId); return { id: m.id, userId: m.userId, name: u?.name, email: u?.email, role: m.role, title: m.title, disabled: !!m.disabled }; }),
  invites: db.invites.filter((i) => i.orgId === s!.org.id && !i.used && new Date(i.expires) > new Date()).map((i) => ({ id: i.id, email: i.email, role: i.role, link: `${appUrl()}/signup?invite=${i.token}` })),
}))), { roles: ADMINS });

export const POST = api(async (req, _c, s) => {
  const d = z.object({ email, role: z.enum(["org_admin", "institution_admin", "instructor", "ta", "examiner", "student"]), studentId: z.string().optional() }).parse(await body(req));
  if (d.role === "org_admin" && s!.role !== "org_admin") throw new HttpError(403, "Only an Organization Administrator can invite another one.");
  const token = crypto.randomBytes(24).toString("base64url");
  await tx((db) => {
    if (db.memberships.some((m) => m.orgId === s!.org.id && db.users.find((u) => u.id === m.userId)?.email === d.email)) throw new HttpError(409, "This person is already a member of the workspace.");
    db.invites = db.invites.filter((i) => !(i.orgId === s!.org.id && i.email === d.email && !i.used));
    db.invites.push({ id: uid("i_"), orgId: s!.org.id, email: d.email, role: d.role, studentId: d.studentId, token, expires: new Date(Date.now() + 7 * 864e5).toISOString(), createdAt: now() });
    audit(db, s!.org.id, s!.user, "team.invited", { email: d.email, role: d.role });
  });
  const link = `${appUrl()}/signup?invite=${token}`;
  let emailed = false;
  if (mailConfigured()) emailed = await sendMail(d.email, `You are invited to ${s!.org.name} on Grader AI`, `${s!.user.name} invited you to join ${s!.org.name}.\n\nAccept the invitation: ${link}\n\nThis link expires in 7 days.`).catch(() => false);
  return json({ ok: true, link, emailed });
}, { roles: ADMINS });

export const PATCH = api(async (req, _c, s) => {
  const d = z.object({ id: z.string(), role: z.enum(["org_admin", "institution_admin", "instructor", "ta", "examiner", "student"]).optional(), disabled: z.boolean().optional() }).parse(await body(req));
  await tx((db) => {
    const m = db.memberships.find((x) => x.id === d.id && x.orgId === s!.org.id); if (!m) throw new HttpError(404, "Member not found.");
    if (m.userId === s!.user.id) throw new HttpError(400, "You cannot change your own access.");
    if ((m.role === "org_admin" || d.role === "org_admin") && s!.role !== "org_admin") throw new HttpError(403, "Only an Organization Administrator can change administrator access.");
    if (d.role) m.role = d.role; if (d.disabled !== undefined) m.disabled = d.disabled;
    audit(db, s!.org.id, s!.user, "team.updated", { member: m.userId, role: m.role, disabled: !!m.disabled });
  });
  return json({ ok: true });
}, { roles: ADMINS });
