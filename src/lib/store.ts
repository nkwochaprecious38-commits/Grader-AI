import crypto from "crypto";
import { admin } from "./supa";

export type Rec = { id: string; orgId: string; createdAt: string; updatedAt?: string; demo?: boolean; [k: string]: any };
export type DB = {
  users: any[]; orgs: any[]; memberships: any[]; invites: any[]; tokens: any[];
  data: Record<string, Rec[]>;
};

/** Table mapping between the in memory snapshot and the grader_ai Postgres tables. */
const TABLES = {
  orgs: { table: "organizations", from: (r: any) => ({ id: r.id, name: r.name, type: r.org_type, demo: r.demo, createdAt: r.created_at }), to: (o: any) => ({ id: o.id, name: o.name, org_type: o.type, demo: !!o.demo }) },
  users: { table: "profiles", from: (r: any) => ({ id: r.id, name: r.full_name, email: r.email, createdAt: r.created_at }), to: (u: any) => ({ id: u.id, full_name: u.name, email: u.email }) },
  memberships: { table: "memberships", from: (r: any) => ({ id: r.id, userId: r.user_id, orgId: r.org_id, role: r.role, title: r.job_title, disabled: r.disabled, createdAt: r.created_at }), to: (m: any) => ({ id: m.id, user_id: m.userId, org_id: m.orgId, role: m.role, job_title: m.title ?? null, disabled: !!m.disabled }) },
  invites: { table: "invites", from: (r: any) => ({ id: r.id, orgId: r.org_id, email: r.email, role: r.role, studentId: r.student_id, token: r.token, used: r.used, expires: r.expires, createdAt: r.created_at }), to: (i: any) => ({ id: i.id, org_id: i.orgId, email: i.email, role: i.role, student_id: i.studentId ?? null, token: i.token, used: !!i.used, expires: i.expires }) },
  tokens: { table: "app_tokens", from: (r: any) => ({ id: r.id, userId: r.user_id, type: r.kind, hash: r.hash, expires: r.expires }), to: (t: any) => ({ id: t.id, user_id: t.userId, kind: t.type, hash: t.hash, expires: t.expires }) },
} as const;
const ORDER = ["orgs", "users", "memberships", "invites", "tokens"] as const;

async function fetchAll(table: string): Promise<any[]> {
  const out: any[] = []; const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await admin().from(table).select("*").order("id").range(from, from + page - 1);
    if (error) throw new Error(`Database read failed (${table}): ${error.message}`);
    out.push(...data); if (data.length < page) break;
  }
  return out;
}
async function load(): Promise<DB> {
  const [orgs, users, memberships, invites, tokens, records] = await Promise.all(["organizations", "profiles", "memberships", "invites", "app_tokens", "records"].map(fetchAll));
  const db: DB = { orgs: orgs.map(TABLES.orgs.from), users: users.map(TABLES.users.from), memberships: memberships.map(TABLES.memberships.from), invites: invites.map(TABLES.invites.from), tokens: tokens.map(TABLES.tokens.from), data: {} };
  for (const r of records) (db.data[r.collection] ||= []).push(r.data);
  return db;
}
const snap = (db: DB) => {
  const m = new Map<string, string>();
  for (const k of ORDER) for (const r of db[k]) m.set(k + ":" + r.id, JSON.stringify(r));
  for (const [c, rows] of Object.entries(db.data)) for (const r of rows) m.set("rec:" + c + ":" + r.id, JSON.stringify(r));
  return m;
};
const chunks = <T,>(a: T[], n = 400) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

async function persist(db: DB, before: Map<string, string>) {
  const after = snap(db);
  const up: Record<string, any[]> = {}; const del: Record<string, string[]> = {};
  const recUp: any[] = []; const recDel: string[] = [];
  for (const k of ORDER) { for (const r of db[k]) if (before.get(k + ":" + r.id) !== after.get(k + ":" + r.id)) (up[k] ||= []).push(TABLES[k].to(r)); }
  for (const [c, rows] of Object.entries(db.data)) for (const r of rows) if (before.get("rec:" + c + ":" + r.id) !== after.get("rec:" + c + ":" + r.id)) recUp.push({ id: r.id, org_id: r.orgId, collection: c, data: r, updated_at: new Date().toISOString() });
  for (const key of before.keys()) if (!after.has(key)) { const parts = key.split(":"); if (parts[0] === "rec") recDel.push(parts[2]); else (del[parts[0]] ||= []).push(parts[1]); }
  for (const k of ORDER) for (const c of chunks(up[k] || [])) { const { error } = await admin().from(TABLES[k].table).upsert(c); if (error) throw new Error(`Database write failed (${TABLES[k].table}): ${error.message}`); }
  for (const c of chunks(recUp)) { const { error } = await admin().from("records").upsert(c); if (error) throw new Error(`Database write failed (records): ${error.message}`); }
  for (const c of chunks(recDel)) { const { error } = await admin().from("records").delete().in("id", c); if (error) throw new Error(error.message); }
  for (const k of [...ORDER].reverse()) for (const c of chunks(del[k] || [])) { const { error } = await admin().from(TABLES[k].table).delete().in("id", c); if (error) throw new Error(error.message); }
}

let cache: { db: DB; at: number } | null = null;
let chain: Promise<unknown> = Promise.resolve();
const TTL = 3000;

/** Serialised access per server instance. Writes always start from a fresh read and only changed rows are written. */
export function tx<T>(fn: (db: DB) => T | Promise<T>, write = true): Promise<T> {
  const run = chain.then(async () => {
    if (!write && cache && Date.now() - cache.at < TTL) return fn(cache.db);
    const db = await load(); const before = write ? snap(db) : null;
    const out = await fn(db);
    if (write) { await persist(db, before!); cache = { db, at: Date.now() }; } else cache = { db, at: Date.now() };
    return out;
  });
  chain = run.catch(() => { cache = null; });
  return run;
}
export const read = <T,>(fn: (db: DB) => T | Promise<T>) => tx(fn, false);
export const uid = (p = "") => p + crypto.randomBytes(9).toString("base64url");
export const uuid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const col = (db: DB, name: string) => (db.data[name] ||= []);

export function audit(db: DB, orgId: string, actor: { id: string; name: string } | null, action: string, detail: any) {
  col(db, "audit").unshift({ id: uid("a_"), orgId, createdAt: now(), actorId: actor?.id, actorName: actor?.name || "System", action, detail });
  const a = col(db, "audit"); if (a.length > 5000) a.length = 5000;
}
export function notify(db: DB, orgId: string, userId: string | null, title: string, body = "") {
  col(db, "notifications").unshift({ id: uid("n_"), orgId, userId, createdAt: now(), title, body, read: false });
}
