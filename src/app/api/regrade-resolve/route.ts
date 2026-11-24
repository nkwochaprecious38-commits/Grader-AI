import { z } from "zod";
import { api, body, json, HttpError } from "@/lib/http";
import { tx, col, now, audit, notify } from "@/lib/store";
import { APPROVERS } from "@/lib/roles";
import { recomputeScore } from "@/lib/grading";

export const POST = api(async (req, _c, s) => {
  const d = z.object({ id: z.string(), decision: z.enum(["adjusted", "unchanged", "clarified"]), response: z.string().trim().min(3, "Write a response for the student."), newScore: z.number().optional() }).parse(await body(req));
  await tx((db) => {
    const r = col(db, "regrades").find((x) => x.id === d.id && x.orgId === s!.org.id); if (!r) throw new HttpError(404, "Request not found.");
    const sub = col(db, "submissions").find((x) => x.id === r.submissionId)!;
    const asg = col(db, "assignments").find((a) => a.id === r.assignmentId);
    if (d.decision === "adjusted") {
      if (d.newScore === undefined || !r.questionId) throw new HttpError(400, "Enter the new score for the question.");
      const max = asg?.questions?.find((q: any) => q.id === r.questionId)?.points ?? 1e9;
      if (d.newScore < 0 || d.newScore > max) throw new HttpError(400, `Score must be between 0 and ${max}.`);
      const old = sub.grades?.[r.questionId]?.score;
      sub.grades = { ...sub.grades, [r.questionId]: { ...(sub.grades?.[r.questionId] || {}), score: d.newScore, comment: `${sub.grades?.[r.questionId]?.comment || ""}`.trim() } };
      recomputeScore(sub);
      audit(db, s!.org.id, s!.user, "grade.changed", { submissionId: sub.id, via: "regrade", question: r.questionId, from: old, to: d.newScore });
    }
    r.status = "resolved"; r.decision = d.decision; r.response = d.response; r.resolvedAt = now();
    r.history.push({ at: now(), by: s!.user.name, action: `Resolved: ${d.decision}`, note: d.response });
    const st = col(db, "students").find((x) => x.id === r.studentId);
    if (st?.userId) notify(db, s!.org.id, st.userId, "Regrade request updated", `${r.assignmentTitle}: ${d.decision}`);
  });
  return json({ ok: true });
}, { roles: APPROVERS });
