import { api, json, HttpError } from "@/lib/http";
import { read, col } from "@/lib/store";

/** Everything a student can see. Unpublished grades, AI suggestions and other students are never included. */
export const GET = api(async (_r, _c, s) => {
  const out = await read((db) => {
    const org = s!.org.id;
    const st = col(db, "students").find((x) => x.id === s!.studentId);
    const courseIds = st?.courseIds || [];
    const courses = col(db, "courses").filter((c) => c.orgId === org && courseIds.includes(c.id) && !c.archived).map(({ id, title, code, term }) => ({ id, title, code, term }));
    const assignments = col(db, "assignments").filter((a) => a.orgId === org && a.status === "published" && courseIds.includes(a.courseId))
      .map((a) => ({ id: a.id, title: a.title, courseId: a.courseId, type: a.type, instructions: a.instructions, total: a.total, due: a.due, release: a.release, late: a.late, format: a.format, language: a.language,
        questions: (a.questions || []).map((q: any) => ({ id: q.id, prompt: q.prompt, type: q.type, points: q.points, options: q.options })), rubricId: a.rubricId }));
    const rubrics = col(db, "rubrics").filter((r) => r.orgId === org).map((r) => ({ id: r.id, name: r.name, criteria: r.criteria.map((c: any) => ({ id: c.id, label: c.label, desc: c.desc, points: c.points, kind: c.kind })) }));
    const submissions = col(db, "submissions").filter((x) => x.orgId === org && x.studentId === s!.studentId).map((x) => {
      const base: any = { id: x.id, assignmentId: x.assignmentId, status: x.published ? "graded" : "submitted", submittedAt: x.submittedAt, late: x.late, files: (x.files || []).map((f: any) => ({ id: f.id, name: f.name, size: f.size })), answers: x.answers, published: !!x.published };
      if (x.published) { base.score = x.override ?? x.score; base.grades = Object.fromEntries(Object.entries<any>(x.grades || {}).map(([q, g]) => [q, { score: g.score, comment: g.comment, criteria: g.criteria }])); base.feedback = x.feedback; }
      return base;
    });
    const regrades = col(db, "regrades").filter((r) => r.orgId === org && r.studentId === s!.studentId);
    const notifications = col(db, "notifications").filter((n) => n.orgId === org && n.userId === s!.user.id).slice(0, 20);
    return { student: st ? { id: st.id, name: st.name } : null, courses, assignments, rubrics, submissions, regrades, notifications };
  });
  return json(out);
}, { roles: ["student"] });
