import { z } from "zod";
import crypto from "crypto";
import { api, body, json } from "@/lib/http";
import { email } from "@/lib/validators";
import { tx, uid } from "@/lib/store";
import { sha } from "@/lib/auth";
import { mailConfigured, sendMail, appUrl } from "@/lib/mail";

export const POST = api(async (req) => {
  const { email: e } = z.object({ email }).parse(await body(req));
  const token = crypto.randomBytes(24).toString("base64url");
  const found = await tx((db) => {
    const u = db.users.find((x) => x.email === e);
    if (!u) return false;
    db.tokens = db.tokens.filter((t) => !(t.userId === u.id && t.type === "reset"));
    db.tokens.push({ id: uid("t_"), userId: u.id, type: "reset", hash: sha(token), expires: new Date(Date.now() + 3600e3).toISOString() });
    return true;
  });
  const link = `${appUrl()}/reset-password?token=${token}`;
  const out: any = { ok: true, message: "If an account exists for that email, a reset link has been sent." };
  if (found) {
    if (mailConfigured()) await sendMail(e, "Reset your Grader AI password", `Use this link to choose a new password. It expires in one hour.\n\n${link}\n\nIf you did not request this, ignore this email.`).catch(() => {});
    else if (process.env.NODE_ENV !== "production" || process.env.EXPOSE_RESET_LINKS === "true") { out.devLink = link; out.message = "Email delivery is not configured on this server. Development reset link is shown below."; console.log("[dev] reset link:", link); }
  }
  return json(out);
}, { auth: false });
