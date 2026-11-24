import { DB, col } from "./store";

const eff = (s: any) => (s.override ?? s.score);
/** Observed analytics from approved grades only. */
export function analytics(db: DB, orgId: string) {
  const asgs = col(db, "assignments").filter((a) => a.orgId === orgId);
  const subsAll = col(db, "submissions").filter((s) => s.orgId === orgId);
  const rubrics = col(db, "rubrics").filter((r) => r.orgId === orgId);
  const courses = col(db, "courses").filter((c) => c.orgId === orgId);
  const per = asgs.map((a) => {
    const subs = subsAll.filter((s) => s.assignmentId === a.id);
    const graded = subs.filter((s) => s.approved && eff(s) != null);
    const pct = graded.map((s) => (eff(s) / (a.total || 1)) * 100);
    const avg = pct.length ? pct.reduce((x, y) => x + y, 0) / pct.length : null;
    const dist = ["0-49", "50-59", "60-69", "70-79", "80-89", "90-100"].map((range, i) => ({ range, count: pct.filter((p) => (i === 0 ? p < 50 : i === 5 ? p >= 90 : p >= 40 + i * 10 && p < 50 + i * 10)).length }));
    const questions = (a.questions || []).map((q: any) => {
      const sc = graded.map((s) => s.grades?.[q.id]?.score).filter((x) => typeof x === "number");
      return { id: q.id, prompt: q.prompt, points: q.points, answered: sc.length, avgPct: sc.length && q.points ? (sc.reduce((x: number, y: number) => x + y, 0) / sc.length / q.points) * 100 : null };
    });
    const crit: Record<string, { label: string; got: number; max: number; n: number }> = {};
    const rub = rubrics.find((r) => r.id === a.rubricId);
    graded.forEach((s) => Object.values<any>(s.grades || {}).forEach((g) => Object.entries<any>(g.criteria || {}).forEach(([cid, v]) => {
      const c = rub?.criteria.find((x: any) => x.id === cid); if (!c || c.kind === "negative") return;
      const e = (crit[cid] ||= { label: c.label, got: 0, max: 0, n: 0 }); e.got += Number(v); e.max += c.points; e.n++;
    })));
    return { id: a.id, title: a.title, course: courses.find((c) => c.id === a.courseId)?.title, courseId: a.courseId, total: a.total, submitted: subs.length, graded: graded.length, pending: subs.filter((s) => !s.approved).length,
      avg, high: pct.length ? Math.max(...pct) : null, low: pct.length ? Math.min(...pct) : null, dist, questions,
      criteria: Object.entries(crit).map(([id, c]) => ({ id, label: c.label, pct: (c.got / c.max) * 100, n: c.n })) };
  });
  const trend = subsAll.filter((s) => s.approved && eff(s) != null && s.approvedAt).sort((a, b) => a.approvedAt.localeCompare(b.approvedAt)).slice(-40);
  return { assignments: per, trend: trend.map((s) => ({ at: s.approvedAt, pct: (eff(s) / (asgs.find((a) => a.id === s.assignmentId)?.total || 1)) * 100 })) };
}
