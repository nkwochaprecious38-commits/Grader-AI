import { api, body, json, HttpError } from "@/lib/http";
import { tx, col, now, audit, notify } from "@/lib/store";
import { policy, clean } from "@/lib/policy";
import { guardGradeChange, recomputeScore, gradesJson } from "@/lib/grading";

export const PATCH = api(async (req, { params }, s) => {
  const { collection: name, id } = await params; const p = policy(name);
  if (!p.write.includes(s!.role)) throw new HttpError(403, "Your role cannot change this record.");
  const patch = clean(await body(req));
  const out = await tx((db) => {
    const rows = col(db, name); const i = rows.findIndex((r) => r.id === id && r.orgId === s!.org.id);
    if (i < 0) throw new HttpError(404, "Record not found.");
    const before = rows[i]; const after = { ...before, ...patch, updatedAt: now() };
    if (name === "submissions") {
      const asg = col(db, "assignments").find((a) => a.id === before.assignmentId);
      if ("grades" in patch && !("override" in patch)) { /* score always derived from grades */ }
      recomputeScore(after);
      if (after.override !== undefined && after.override !== null && after.override !== "") {
        const o = Number(after.override); if (!Number.isFinite(o) || o < 0 || o > (asg?.total ?? 1e9)) throw new HttpError(400, `Score must be between 0 and ${asg?.total}.`);
        after.override = o;
      }
      guardGradeChange(before, after, s!.role, asg);
      if (gradesJson(before) !== gradesJson(after) || before.approved !== after.approved || before.published !== after.published) {
        audit(db, s!.org.id, s!.user, "grade.changed", { submissionId: id, assignment: asg?.title,
          from: { score: before.score, override: before.override, approved: !!before.approved, published: !!before.published },
          to: { score: after.score, override: after.override, approved: !!after.approved, published: !!after.published },
          aiOverrides: Object.entries(after.grades || {}).filter(([q, g]: any) => after.suggestions?.[q] && g.score !== after.suggestions[q].score).map(([q]) => q) });
      }
      if (after.approved && !before.approved) { after.approvedBy = s!.user.name; after.approvedAt = now(); }
      if (after.published && !before.published) {
        const st = col(db, "students").find((x) => x.id === after.studentId);
        if (st?.userId) notify(db, s!.org.id, st.userId, "Grade published", `${asg?.title || "An assessment"} has been graded.`);
      }
    }
    rows[i] = after;
    return after;
  });
  return json(out);
});

export const DELETE = api(async (_r, { params }, s) => {
  const { collection: name, id } = await params; const p = policy(name);
  if (!p.write.includes(s!.role)) throw new HttpError(403, "Your role cannot delete this record.");
  await tx((db) => {
    const rows = col(db, name); const i = rows.findIndex((r) => r.id === id && r.orgId === s!.org.id);
    if (i < 0) throw new HttpError(404, "Record not found.");
    const r = rows[i];
    if (name === "submissions" && (r.approved || r.published)) throw new HttpError(400, "Approved submissions cannot be deleted.");
    rows.splice(i, 1);
    if (name === "assignments") for (const c of ["submissions", "tests"]) db.data[c] = col(db, c).filter((x) => x.assignmentId !== id);
    audit(db, s!.org.id, s!.user, `${name}.deleted`, { id, title: r.title || r.name });
  });
  return json({ ok: true });
});
