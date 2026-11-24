import { z } from "zod";
import { api, body, json, HttpError } from "@/lib/http";
import { tx, col, now, audit } from "@/lib/store";
import { STAFF } from "@/lib/roles";

/** Submitted code is NEVER executed on this server. It is forwarded to an external isolated sandbox service when SANDBOX_URL is configured. */
export const GET = api(async () => json({ configured: !!process.env.SANDBOX_URL }), { roles: STAFF });

export const POST = api(async (req, _c, s) => {
  const { submissionId } = z.object({ submissionId: z.string() }).parse(await body(req));
  if (!process.env.SANDBOX_URL) throw new HttpError(503, "No sandbox service is configured. Set SANDBOX_URL to an isolated execution service. Code is never run on the application server.");
  const ctx = await tx((db) => {
    const sub = col(db, "submissions").find((x) => x.id === submissionId && x.orgId === s!.org.id); if (!sub) throw new HttpError(404, "Submission not found.");
    const a = col(db, "assignments").find((x) => x.id === sub.assignmentId)!;
    return { code: sub.answers?.q1 || "", language: a.language, tests: col(db, "tests").filter((t) => t.assignmentId === a.id), limits: { timeoutMs: 5000, memoryMb: 128, cpus: 0.5, network: false } };
  }, false);
  let out: any;
  try {
    const r = await fetch(process.env.SANDBOX_URL, { method: "POST", headers: { "content-type": "application/json", ...(process.env.SANDBOX_TOKEN ? { authorization: `Bearer ${process.env.SANDBOX_TOKEN}` } : {}) }, body: JSON.stringify(ctx), signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error("status " + r.status); out = await r.json();
  } catch (e: any) { throw new HttpError(502, "The sandbox service did not return a result: " + e.message); }
  const results = (ctx.tests as any[]).map((t, i) => { const o = out.results?.[i] || {}; return { testId: t.id, name: t.name, passed: !!o.passed, output: String(o.output ?? "").slice(0, 2000), timeMs: o.timeMs }; });
  await tx((db) => {
    const sub = col(db, "submissions").find((x) => x.id === submissionId)!; sub.autograder = { at: now(), results };
    const pts = (ctx.tests as any[]).reduce((n, t, i) => n + (results[i].passed ? Number(t.points) || 0 : 0), 0);
    sub.suggestions = { ...sub.suggestions, q1: { score: pts, max: col(db, "assignments").find((a) => a.id === sub.assignmentId)!.total, explanation: `${results.filter((r) => r.passed).length} of ${results.length} tests passed in the sandbox.`, rubricMap: [], confidence: 0.9, flag: false, source: "rules", at: now() } };
    audit(db, s!.org.id, s!.user, "autograder.run", { submissionId });
  });
  return json({ results });
}, { roles: ["org_admin", "institution_admin", "instructor", "ta"] });
