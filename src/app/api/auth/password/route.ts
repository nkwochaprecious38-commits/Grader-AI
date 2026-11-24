import { z } from "zod";
import { api, body, json, HttpError } from "@/lib/http";
import { password } from "@/lib/validators";
import { tx, audit } from "@/lib/store";
import { admin, anon } from "@/lib/supa";

export const POST = api(async (req, _c, s) => {
  const d = z.object({ current: z.string().min(1, "Enter your current password."), password }).parse(await body(req));
  const chk = await anon().auth.signInWithPassword({ email: s!.user.email, password: d.current });
  if (chk.error) throw new HttpError(400, "Current password is incorrect.");
  const u = await admin().auth.admin.updateUserById(s!.user.id, { password: d.password });
  if (u.error) throw new HttpError(400, u.error.message);
  await tx((db) => { audit(db, s!.org.id, s!.user, "auth.password_changed", {}); });
  return json({ ok: true });
});
