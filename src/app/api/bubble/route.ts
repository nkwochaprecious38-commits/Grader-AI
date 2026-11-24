import { z } from "zod";
import { api, body, json, HttpError } from "@/lib/http";
import { tx, col, audit } from "@/lib/store";
import { STAFF } from "@/lib/roles";

/** Scores recorded sheet responses against the answer key for a chosen version. Uncertain marks must be confirmed by a person. */
export const POST = api(async (req, _c, s) => {
  const d = z.object({ assignmentId: z.string(), studentId: z.string(), version: z.string().default("A"), responses: z.record(z.string(), z.string().max(4)), uncertain: z.array(z.string()).default([]), confirmed: z.boolean().default(false) }).parse(await body(req));
  if (d.uncertain.length && !d.confirmed) throw new HttpError(409, `Confirm the uncertain marks (${d.uncertain.join(", ")}) before scoring.`);
  const out = await tx((db) => {
    const a = col(db, "assignments").find((x) => x.id === d.assignmentId && x.orgId === s!.org.id); if (!a) throw new HttpError(404, "Assignment not found.");
    let sub = col(db, "submissions").find((x) => x.assignmentId === a.id && x.studentId === d.studentId);
    if (sub?.approved) throw new HttpError(400, "This sheet is already approved.");
    const grades: any = {}; 
    for (const q of a.questions || []) {
      const key = (a.versions?.[d.version]?.[q.id] ?? q.key ?? "").toString().trim().toUpperCase();
      const r = (d.responses[q.id] || "").trim().toUpperCase();
      grades[q.id] = { score: key && r === key ? q.points : 0, comment: r ? `Marked ${r}` : "No mark detected" };
    }
    if (!sub) { sub = { id: "s_" + Math.random().toString(36).slice(2, 10), orgId: s!.org.id, createdAt: new Date().toISOString(), assignmentId: a.id, studentId: d.studentId, files: [], answers: {}, suggestions: {}, approved: false, published: false, status: "graded" }; col(db, "submissions").push(sub); }
    sub.answers = { ...sub.answers, ...d.responses }; sub.grades = grades; sub.version = d.version; sub.status = "graded";
    sub.score = Object.values<any>(grades).reduce((n, g) => n + g.score, 0);
    audit(db, s!.org.id, s!.user, "bubble.scored", { assignment: a.title, student: d.studentId, version: d.version, uncertain: d.uncertain });
    return { score: sub.score, total: a.total };
  });
  return json(out);
}, { roles: STAFF });
