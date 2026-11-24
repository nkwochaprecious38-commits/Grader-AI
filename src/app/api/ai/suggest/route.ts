import { z } from "zod";
import { api, body, json, HttpError } from "@/lib/http";
import { tx, col, audit } from "@/lib/store";
import { suggest } from "@/lib/ai";
import { STAFF } from "@/lib/roles";

/** Generates and stores draft suggestions only. Never sets grades, approval or publication. */
export const POST = api(async (req, _c, s) => {
  const d = z.object({ submissionIds: z.array(z.string()).min(1).max(100) }).parse(await body(req));
  const ctx = await tx((db) => {
    const subs = col(db, "submissions").filter((x) => x.orgId === s!.org.id && d.submissionIds.includes(x.id) && !x.approved);
    return subs.map((sub) => { const a = col(db, "assignments").find((x) => x.id === sub.assignmentId); return { sub: { id: sub.id, answers: sub.answers }, a, rubric: col(db, "rubrics").find((r) => r.id === a?.rubricId) || null }; });
  }, false);
  if (!ctx.length) throw new HttpError(400, "No ungraded submissions selected.");
  const results: Record<string, any> = {};
  for (const c of ctx) {
    results[c.sub.id] = {};
    for (const q of c.a?.questions || []) {
      if (q.type === "code") continue;
      results[c.sub.id][q.id] = await suggest(q, c.sub.answers?.[q.id] || "", q.rubricId ? c.rubric : null);
    }
  }
  await tx((db) => {
    for (const [id, sug] of Object.entries(results)) {
      const sub = col(db, "submissions").find((x) => x.id === id)!; sub.suggestions = sug; sub.status = "suggested";
    }
    audit(db, s!.org.id, s!.user, "ai.suggestions_generated", { submissions: Object.keys(results).length });
  });
  return json({ ok: true, count: Object.keys(results).length, engine: process.env.ANTHROPIC_API_KEY ? "model" : "rules" });
}, { roles: STAFF });
