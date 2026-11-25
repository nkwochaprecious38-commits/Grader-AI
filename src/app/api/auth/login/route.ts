import { z } from "zod";
import { api, body, json, HttpError } from "@/lib/http";
import { email } from "@/lib/validators";
import { tx, audit, now, uuid } from "@/lib/store";
import { issueSession, throttle, failed, cleared } from "@/lib/auth";
import { linkStudent } from "@/lib/students";
import { anon } from "@/lib/supa";

const schema = z.object({ email, password: z.string().min(1, "Enter your password."), remember: z.boolean().optional(), invite: z.string().optional() });

export const POST = api(async (req) => {
  const d = schema.parse(await body(req));
  const key = d.email;
  const wait = throttle(key);
  if (wait) throw new HttpError(429, `Too many failed attempts. Try again in ${wait} minute${wait > 1 ? "s" : ""}.`);
  const r = await anon().auth.signInWithPassword({ email: d.email, password: d.password });
  if (r.error || !r.data.user) {
    const e: any = r.error;
    if (/not confirmed/i.test(e?.message || "")) throw new HttpError(403, "Please verify your email address first. Check your inbox for the verification link.");
    // Only a genuine credentials failure is reported as one. Anything else is a system problem: log it for the operator.
    if (e && (e.status === 400 || e.status === 422 || e.code === "invalid_credentials")) { failed(key); throw new HttpError(401, "Incorrect email or password."); }
    console.error("[auth] Supabase sign in failed:", e?.status, e?.message);
    throw new Error("Supabase sign in failed: " + (e?.message || "unknown"));
  }
  const authUser = r.data.user;
  const out = await tx((db) => {
    let user = db.users.find((u) => u.id === authUser.id);
    if (d.invite) {
      const inv = db.invites.find((i) => i.token === d.invite && !i.used && i.email === d.email && new Date(i.expires) > new Date());
      if (!inv) throw new HttpError(400, "This invitation is invalid, expired, or was sent to a different email.");
      if (!user) { user = { id: authUser.id, name: authUser.user_metadata?.full_name || d.email, email: d.email, createdAt: now() }; db.users.push(user); }
      inv.used = true;
      if (!db.memberships.some((m) => m.userId === user!.id && m.orgId === inv.orgId)) db.memberships.push({ id: uuid(), userId: user.id, orgId: inv.orgId, role: inv.role, createdAt: now() });
      linkStudent(db, inv.orgId, user, inv.studentId);
    }
    const ms = db.memberships.filter((m) => m.userId === authUser.id && !m.disabled);
    if (!user || !ms.length) throw new HttpError(403, "This account does not have a Grader AI workspace. Create one on the sign up page, or ask your administrator for an invitation.");
    const m = (d.invite && ms.find((x) => x.orgId === db.invites.find((i) => i.token === d.invite)?.orgId)) || ms[0];
    audit(db, m.orgId, { id: user.id, name: user.name }, "auth.login", {});
    return { uid: user.id, oid: m.orgId, role: m.role };
  });
  cleared(key);
  await issueSession(out.uid, out.oid, !!d.remember);
  return json({ ok: true, redirect: out.role === "student" ? "/app/student" : "/app" });
}, { auth: false });
