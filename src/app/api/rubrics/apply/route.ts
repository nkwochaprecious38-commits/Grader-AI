import { z } from "zod";
import { api, body, json, HttpError } from "@/lib/http";
import { tx, col, now, audit } from "@/lib/store";
import { recomputeScore } from "@/lib/grading";
import { APPROVERS } from "@/lib/roles";

/** Recalculates scores for questions graded with rubric criteria after the rubric changed. Records the effect. */
export const POST = api(async (req, _c, s) => {
  const { rubricId } = z.object({ rubricId: z.string() }).parse(await body(req));
  const res = await tx((db) => {
    const r = col(db, "rubrics").find((x) => x.id === rubricId && x.orgId === s!.org.id); if (!r) throw new HttpError(404, "Rubric not found.");
    const asgs = col(db, "assignments").filter((a) => a.rubricId === rubricId || a.questions?.some((q: any) => q.rubricId === rubricId));
    let affected = 0, changed = 0;
    for (const sub of col(db, "submissions")) {
      const a = asgs.find((x) => x.id === sub.assignmentId); if (!a || sub.orgId !== s!.org.id) continue;
      let touched = false;
      for (const q of a.questions || []) {
        if ((q.rubricId || a.rubricId) !== rubricId) continue;
        const g = sub.grades?.[q.id]; if (!g?.criteria) continue;
        let tot = 0;
        for (const c of r.criteria) { const v = Number(g.criteria[c.id] ?? 0); tot += c.kind === "negative" ? -Math.min(Math.abs(v), Math.abs(c.points)) : Math.min(v, c.points); }
        tot = Math.max(0, Math.min(q.points, tot));
        if (tot !== g.score) { g.score = tot; touched = true; changed++; }
      }
      if (touched) { affected++; recomputeScore(sub); }
    }
    r.history = [...(r.history || []), { at: now(), by: s!.user.name, action: "Applied to graded submissions", affected, changed }];
    audit(db, s!.org.id, s!.user, "rubric.applied", { rubric: r.name, affected, changed });
    return { affected, changed };
  });
  return json(res);
}, { roles: APPROVERS });
