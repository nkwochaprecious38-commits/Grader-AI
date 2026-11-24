import { NextResponse } from "next/server";
import { tx } from "@/lib/store";
import { sha } from "@/lib/auth";
import { appUrl } from "@/lib/mail";
import { admin } from "@/lib/supa";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const userId = await tx((db) => {
    const t = db.tokens.find((x) => x.type === "verify" && x.hash === sha(token) && new Date(x.expires) > new Date());
    if (!t) return null;
    db.tokens = db.tokens.filter((x) => x.id !== t.id);
    return t.userId as string;
  });
  let ok = false;
  if (userId) ok = !(await admin().auth.admin.updateUserById(userId, { email_confirm: true })).error;
  return NextResponse.redirect(`${appUrl()}/login?${ok ? "verified=1" : "verifyfailed=1"}`);
}
