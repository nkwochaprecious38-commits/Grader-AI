import { APPROVERS, type Role } from "./roles";
import { HttpError } from "./http";

export function recomputeScore(sub: any) {
  const g = sub.grades || {};
  const vals = Object.values(g).map((x: any) => Number(x?.score)).filter((n) => Number.isFinite(n));
  sub.score = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) * 100) / 100 : null;
}
export const gradesJson = (s: any) => JSON.stringify(s.grades || {}) + "|" + s.override;

/** Enforces: only approvers approve, nothing publishes before approval. */
export function guardGradeChange(before: any, after: any, role: Role, assignment: any) {
  const total = assignment?.total ?? Infinity;
  for (const [qid, g] of Object.entries<any>(after.grades || {})) {
    const q = assignment?.questions?.find((x: any) => x.id === qid);
    const max = q?.points ?? total;
    if (!Number.isFinite(Number(g.score)) || g.score < 0 || g.score > max)
      throw new HttpError(400, `Score for a question must be between 0 and ${max}.`);
  }
  if (after.approved && !before.approved && !APPROVERS.includes(role)) throw new HttpError(403, "Only an instructor, examiner or administrator can approve grades.");
  if (after.approved && gradesJson(before) !== gradesJson(after) && before.approved && !APPROVERS.includes(role)) throw new HttpError(403, "Approved grades can only be changed by an instructor, examiner or administrator.");
  if (after.published && !after.approved) throw new HttpError(400, "Grades must be approved by an instructor before they can be published.");
  if (after.published && !before.published && !APPROVERS.includes(role)) throw new HttpError(403, "Only an instructor, examiner or administrator can publish grades.");
}
