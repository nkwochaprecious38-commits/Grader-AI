import { z } from "zod";
import { api, body, json, HttpError } from "@/lib/http";
import { password } from "@/lib/validators";
import { tx } from "@/lib/store";
import { sha } from "@/lib/auth";
import { admin } from "@/lib/supa";

export const POST = api(async (req) => {
  const d = z.object({ token: z.string().min(10, "This reset link is invalid."), password, confirm: z.string() })
    .refine((x) => x.password === x.confirm, { message: "Passwords do not match.", path: ["confirm"] }).parse(await body(req));
  const userId = await tx((db) => {
    const t = db.tokens.find((x) => x.type === "reset" && x.hash === sha(d.token) && new Date(x.expires) > new Date());
    if (!t) throw new HttpError(400, "This reset link is invalid or has expired. Request a new one.");
    db.tokens = db.tokens.filter((x) => x.id !== t.id);
    return t.userId as string;
  });
  const u = await admin().auth.admin.updateUserById(userId, { password: d.password, email_confirm: true });
  if (u.error) throw new HttpError(400, u.error.message);
  return json({ ok: true });
}, { auth: false });
