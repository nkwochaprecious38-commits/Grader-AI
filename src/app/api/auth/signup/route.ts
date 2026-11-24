import crypto from "crypto";
import { api, body, json, HttpError } from "@/lib/http";
import { signupSchema } from "@/lib/validators";
import { tx, uid, uuid, now, audit } from "@/lib/store";
import { issueSession, sha } from "@/lib/auth";
import { mailConfigured, sendMail, appUrl } from "@/lib/mail";
import { seedDemo } from "@/lib/seed";
import { linkStudent } from "@/lib/students";
import { admin, anon } from "@/lib/supa";

const EXISTS = "An account with this email already exists. Log in instead, or reset your password.";

export const POST = api(async (req) => {
  const raw = await body(req);
  if (raw?.invite) { raw.organization = "Invited workspace"; raw.orgType = "Invited member"; raw.role = raw.role || "Team member"; }
  const d = signupSchema.parse(raw);
  let needsVerify = mailConfigured();

  // Validate the invitation before creating anything.
  if (d.invite) {
    const inv = await tx((db) => db.invites.find((i) => i.token === d.invite && !i.used && new Date(i.expires) > new Date()), false);
    if (!inv) throw new HttpError(400, "This invitation is invalid or has expired. Ask your administrator for a new one.");
    if (inv.email !== d.email) throw new HttpError(400, `This invitation was sent to ${inv.email}. Use that email address to join.`);
  }

  // Shared Supabase project: the email may already belong to an account from another app.
  let userId: string; let created = false;
  const c = await admin().auth.admin.createUser({ email: d.email, password: d.password, email_confirm: !needsVerify, user_metadata: { full_name: d.fullName } });
  if (c.error || !c.data.user) {
    if (!/already|registered|exists/i.test(c.error?.message || "")) throw new HttpError(400, c.error?.message || "Could not create the account.");
    const s = await anon().auth.signInWithPassword({ email: d.email, password: d.password });
    if (s.error || !s.data.user) throw new HttpError(409, EXISTS);
    userId = s.data.user.id; needsVerify = false;
    const has = !d.invite && await tx((db) => db.memberships.some((m) => m.userId === userId), false);
    if (has) throw new HttpError(409, EXISTS);
  } else { userId = c.data.user.id; created = true; }

  const verifyToken = crypto.randomBytes(24).toString("base64url");
  let orgId = "";
  try {
    orgId = await tx((db) => {
      let user = db.users.find((u) => u.id === userId);
      if (!user) { user = { id: userId, name: d.fullName, email: d.email, createdAt: now() }; db.users.push(user); }
      let role = "org_admin"; let oid: string;
      if (d.invite) {
        const inv = db.invites.find((i) => i.token === d.invite && !i.used && new Date(i.expires) > new Date());
        if (!inv) throw new HttpError(400, "This invitation is invalid or has expired. Ask your administrator for a new one.");
        inv.used = true; oid = inv.orgId; role = inv.role;
        db.memberships.push({ id: uuid(), userId, orgId: oid, role, title: d.role, createdAt: now() });
        linkStudent(db, oid, user, inv.studentId);
      } else {
        oid = uuid();
        db.orgs.push({ id: oid, name: d.organization, type: d.orgType, demo: true, createdAt: now() });
        db.memberships.push({ id: uuid(), userId, orgId: oid, role, title: d.role, createdAt: now() });
        seedDemo(db, oid);
      }
      if (needsVerify) db.tokens.push({ id: uid("t_"), userId, type: "verify", hash: sha(verifyToken), expires: new Date(Date.now() + 48 * 3600e3).toISOString() });
      audit(db, oid, { id: userId, name: user.name }, "account.created", { role });
      return oid;
    });
  } catch (e) {
    if (created) await admin().auth.admin.deleteUser(userId).catch(() => {});
    throw e;
  }
  if (needsVerify) {
    await sendMail(d.email, "Verify your Grader AI email", `Welcome to Grader AI.\n\nConfirm your email address to activate your account:\n${appUrl()}/api/auth/verify?token=${verifyToken}\n\nThe link expires in 48 hours.`).catch(() => {});
    return json({ ok: true, needsVerification: true });
  }
  await issueSession(userId, orgId, false);
  return json({ ok: true, redirect: "/app" });
}, { auth: false });
