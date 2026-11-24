import { z } from "zod";
import crypto from "crypto";
import { api, body, json } from "@/lib/http";
import { email } from "@/lib/validators";
import { tx, uid } from "@/lib/store";
import { sha } from "@/lib/auth";
import { sendMail, appUrl, mailConfigured } from "@/lib/mail";
import { admin } from "@/lib/supa";

export const POST = api(async (req) => {
  const { email: e } = z.object({ email }).parse(await body(req));
  const token = crypto.randomBytes(24).toString("base64url");
  const profile = await tx((db) => db.users.find((x) => x.email === e), false);
  let ok = false;
  if (profile) {
    const u = await admin().auth.admin.getUserById(profile.id);
    if (u.data.user && !u.data.user.email_confirmed_at) {
      await tx((db) => { db.tokens.push({ id: uid("t_"), userId: profile.id, type: "verify", hash: sha(token), expires: new Date(Date.now() + 48 * 3600e3).toISOString() }); });
      ok = true;
    }
  }
  if (ok && mailConfigured()) await sendMail(e, "Verify your Grader AI email", `Confirm your email:\n${appUrl()}/api/auth/verify?token=${token}`).catch(() => {});
  return json({ ok: true, message: "If that account needs verification, a new link has been sent." });
}, { auth: false });
