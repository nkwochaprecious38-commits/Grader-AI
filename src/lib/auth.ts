import crypto from "crypto";
import fs from "fs";
import path from "path";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { read } from "./store";

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), ".data"));
import type { Role } from "./roles";

export const COOKIE = "gai_session";

function secret(): Uint8Array {
  let s = process.env.SESSION_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set in production");
    const f = path.join(DATA_DIR, "dev-secret");
    try { s = fs.readFileSync(f, "utf8"); } catch {
      s = crypto.randomBytes(32).toString("hex");
      fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(f, s, { mode: 0o600 });
    }
  }
  return new TextEncoder().encode(s);
}

export const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function issueSession(userId: string, orgId: string, remember: boolean) {
  const exp = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12;
  const jwt = await new SignJWT({ uid: userId, oid: orgId })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${exp}s`).sign(secret());
  (await cookies()).set(COOKIE, jwt, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/",
    ...(remember ? { maxAge: exp } : {}),
  });
}
export async function clearSession() { (await cookies()).delete(COOKIE); }

export type Session = {
  user: { id: string; name: string; email: string };
  org: { id: string; name: string; type: string; demo?: boolean };
  role: Role; title?: string; studentId?: string | null;
};

/** Resolves the current session and re-checks membership against the database on every call. */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  let p: any;
  try { p = (await jwtVerify(token, secret())).payload; } catch { return null; }
  return read((db) => {
    const user = db.users.find((u) => u.id === p.uid);
    const m = db.memberships.find((x) => x.userId === p.uid && x.orgId === p.oid && !x.disabled);
    const org = db.orgs.find((o) => o.id === p.oid);
    if (!user || !m || !org) return null;
    const st = (db.data.students || []).find((s) => s.orgId === org.id && s.userId === user.id);
    return {
      user: { id: user.id, name: user.name, email: user.email },
      org: { id: org.id, name: org.name, type: org.type, demo: org.demo },
      role: m.role as Role, title: m.title, studentId: st?.id ?? null,
    };
  });
}

const attempts = new Map<string, { n: number; until: number }>();
export function throttle(key: string) {
  const a = attempts.get(key);
  if (a && a.until > Date.now() && a.n >= 6) return Math.ceil((a.until - Date.now()) / 60000);
  return 0;
}
export function failed(key: string) {
  const a = attempts.get(key);
  attempts.set(key, { n: (a && a.until > Date.now() ? a.n : 0) + 1, until: Date.now() + 15 * 60000 });
}
export const cleared = (key: string) => attempts.delete(key);
