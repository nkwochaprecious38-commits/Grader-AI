import { DB, col } from "./store";
import { analytics } from "./analytics";

type Answer = { observed: string[]; suggestions: string[]; note?: string };
const f1 = (n: number | null) => (n == null ? "no graded data yet" : `${n.toFixed(1)}%`);

/** Answers strictly from workspace records. Observed facts and suggestions are returned separately. */
export function ask(db: DB, orgId: string, qRaw: string): Answer {
  const q = qRaw.toLowerCase();
  const A = analytics(db, orgId); const asgs = A.assignments;
  const subs = col(db, "submissions").filter((s) => s.orgId === orgId);
  const students = col(db, "students").filter((s) => s.orgId === orgId);
  const named = asgs.find((a) => q.includes(a.title.toLowerCase())) || asgs.find((a) => a.graded) || asgs[0];
  const none: Answer = { observed: ["There are no assignments in this workspace yet."], suggestions: ["Create an assignment to start collecting data."] };
  if (!asgs.length) return none;

  if (/(await|pending|ungraded|not graded|to grade)/.test(q)) {
    const p = subs.filter((s) => !s.approved);
    return { observed: [`${p.length} submission${p.length === 1 ? " is" : "s are"} awaiting approval.`, ...asgs.filter((a) => a.pending).map((a) => `${a.title}: ${a.pending} pending`)], suggestions: p.length ? ["Open AI Grading to generate draft suggestions, then review and approve each one."] : [] };
  }
  if (/(manual review|uncertain|flag)/.test(q)) {
    const fl = subs.flatMap((s) => Object.entries<any>(s.suggestions || {}).filter(([, v]) => v.flag && !s.approved).map(([qid, v]) => ({ s, qid, v })));
    const noSug = subs.filter((s) => !s.approved && !Object.keys(s.suggestions || {}).length).length;
    return { observed: [`${fl.length} AI suggestion${fl.length === 1 ? "" : "s"} flagged for manual review.`, ...fl.slice(0, 8).map(({ s, qid, v }) => `${students.find((x) => x.id === s.studentId)?.name || "Student"}, ${asgs.find((a) => a.id === s.assignmentId)?.title} ${qid}: ${v.flagReason}`), `${noSug} ungraded submission${noSug === 1 ? " has" : "s have"} no suggestion yet.`], suggestions: ["Review flagged answers against the original submission before approving."] };
  }
  if (/compare/.test(q)) {
    const g = asgs.filter((a) => a.graded);
    if (g.length < 2) return { observed: [`Only ${g.length} assignment${g.length === 1 ? " has" : "s have"} approved grades, so a comparison is not possible yet.`], suggestions: [] };
    return { observed: g.map((a) => `${a.title}: average ${f1(a.avg)} across ${a.graded} graded submissions`), suggestions: ["Differences may reflect difficulty rather than learning: check question level results before drawing conclusions."] };
  }
  if (/(lowest|hardest|missed|difficult)/.test(q)) {
    const qs = named.questions.filter((x: any) => x.avgPct != null).sort((a: any, b: any) => a.avgPct - b.avgPct).slice(0, 3);
    if (!qs.length) return { observed: [`${named.title} has no approved grades yet.`], suggestions: [] };
    return { observed: [`Lowest scoring questions in ${named.title}:`, ...qs.map((x: any) => `${x.id}: ${x.avgPct.toFixed(0)}% average, "${x.prompt.slice(0, 80)}"`)], suggestions: ["Consider revisiting the underlying concept in class or checking whether the question wording was clear."] };
  }
  if (/(mistake|misconception|common)/.test(q)) {
    const c = [...named.criteria].sort((a, b) => a.pct - b.pct).slice(0, 3);
    if (!c.length) return { observed: [`No rubric criterion data is available for ${named.title} yet.`], suggestions: ["Score answers using rubric criteria to enable this analysis."] };
    return { observed: [`Weakest rubric criteria in ${named.title}:`, ...c.map((x) => `${x.label}: ${x.pct.toFixed(0)}% of available points earned`)], suggestions: ["Address the weakest criterion in feedback to the whole class."] };
  }
  if (/(draft|feedback)/.test(q)) {
    const st = students.find((s) => q.includes(s.name.toLowerCase().split(" ")[0]));
    const sub = subs.find((s) => st && s.studentId === st.id && s.grades && Object.keys(s.grades).length);
    if (!st || !sub) return { observed: ["Name a student whose work has been scored, for example: Draft feedback for Amara."], suggestions: [] };
    const asg = asgs.find((a) => a.id === sub.assignmentId);
    const low = Object.entries<any>(sub.grades).filter(([id, g]) => { const qq = asg && col(db, "assignments").find((a) => a.id === asg.id)?.questions.find((x: any) => x.id === id); return qq && g.score < qq.points; });
    return { observed: [`${st.name}, ${asg?.title}: ${sub.override ?? sub.score} of ${asg?.total}.`, ...low.map(([id, g]) => `${id}: ${g.score}${g.comment ? `, comment: ${g.comment}` : ""}`)], suggestions: [`Draft: "Thank you for your work on ${asg?.title}. You earned ${sub.override ?? sub.score} of ${asg?.total}. ${low.length ? `Review ${low.map(([id]) => id).join(", ")} where marks were lost and refer to the rubric.` : "You met the expected criteria across all questions."}" Edit before sending.`] };
  }
  if (/(course|across)/.test(q)) {
    const by = new Map<string, { t: string; v: number[] }>();
    asgs.filter((a) => a.avg != null).forEach((a) => { const e: { t: string; v: number[] } = by.get(a.courseId) || { t: a.course || "Unassigned", v: [] as number[] }; e.v.push(a.avg!); by.set(a.courseId, e); });
    return { observed: by.size ? [...by.values()].map((e) => `${e.t}: ${f1(e.v.reduce((x, y) => x + y, 0) / e.v.length)} average across ${e.v.length} assessed assignment${e.v.length > 1 ? "s" : ""}`) : ["No approved grades exist yet."], suggestions: [] };
  }
  // default: class summary
  if (named.graded === 0) return { observed: [`${named.title}: ${named.submitted} submissions received, none approved yet.`], suggestions: ["Approve grades to see performance summaries."] };
  return { observed: [`${named.title}: ${named.graded} graded of ${named.submitted} submitted.`, `Average ${f1(named.avg)}, highest ${f1(named.high)}, lowest ${f1(named.low)}.`], suggestions: [named.avg != null && named.avg < 60 ? "The average is below 60%: consider reviewing the lowest scoring questions with the class." : "Results are in a typical range. Check question level performance for specific gaps."], note: "Ask for lowest questions, common mistakes, or awaiting grading for more." };
}
