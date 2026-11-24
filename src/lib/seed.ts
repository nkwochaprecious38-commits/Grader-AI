import { DB, Rec, col, uid, now } from "./store";

/** Clearly flagged demonstration records so a new workspace is not empty. Remove from Settings. */
export function seedDemo(db: DB, orgId: string) {
  const mk = (c: string, r: any): Rec => { const rec = { id: uid(c[0] + "_"), orgId, createdAt: now(), demo: true, ...r }; col(db, c).push(rec); return rec; };
  const c1 = mk("courses", { title: "Introduction to Biology", code: "BIO101", term: "Autumn 2026", description: "Sample course", archived: false, instructors: [], groups: [] });
  const c2 = mk("courses", { title: "Foundations of Programming", code: "CS110", term: "Autumn 2026", description: "Sample course", archived: false, instructors: [], groups: [] });
  const names = ["Amara Okafor", "Liam Chen", "Sofia Rossi", "Noah Williams", "Priya Nair", "Daniel Mensah", "Elena Petrova", "Yusuf Ibrahim"];
  const studs = names.map((n, i) => mk("students", { name: n, email: `demo.student${i + 1}@example.invalid`, studentNumber: `S10${i + 1}`, courseIds: i < 5 ? [c1.id, c2.id] : [c1.id] }));
  const rub = mk("rubrics", { name: "Short answer: cell biology", history: [], criteria: [
    { id: "c1", label: "Identifies the organelle", desc: "Names mitochondria as the site of aerobic respiration", points: 2, kind: "positive", keywords: ["mitochondria", "mitochondrion"] },
    { id: "c2", label: "Explains the energy output", desc: "States that ATP is produced", points: 2, kind: "positive", keywords: ["atp", "energy"] },
    { id: "c3", label: "Mentions the inputs", desc: "Glucose and oxygen are used", points: 1, kind: "positive", keywords: ["glucose", "oxygen"] },
  ]});
  const q = (id: string, prompt: string, type: string, points: number, key: string, rubricId?: string) => ({ id, prompt, type, points, key, rubricId });
  const a1 = mk("assignments", { title: "Cell Biology Quiz", courseId: c1.id, type: "Quiz", instructions: "Answer all questions.", total: 9, status: "published", release: "2026-10-01", due: "2026-12-05", late: "Accept with 10% daily penalty", format: "Online", rubricId: rub.id,
    questions: [q("q1", "Which organelle is the main site of aerobic respiration?", "mcq", 2, "Mitochondria"), q("q2", "Describe what happens during aerobic respiration and why it matters to the cell.", "short", 5, "mitochondria; atp energy; glucose oxygen", rub.id), q("q3", "True or false: ribosomes are the site of protein synthesis.", "mcq", 2, "True")] });
  const a2 = mk("assignments", { title: "Midterm Examination", courseId: c1.id, type: "Examination", instructions: "Closed book.", total: 9, status: "draft", release: "2026-12-10", due: "2026-12-10", late: "No late submissions", format: "Scanned paper", rubricId: rub.id, questions: [q("q1", "Explain the role of mitochondria.", "short", 9, "mitochondria; atp energy; glucose oxygen", rub.id)] });
  const a3 = mk("assignments", { title: "Python Functions Lab", courseId: c2.id, type: "Programming assignment", instructions: "Write a function add(a, b) that returns the sum.", total: 10, status: "published", release: "2026-10-15", due: "2026-12-12", late: "Accept until deadline only", format: "Code", language: "Python", questions: [q("q1", "Implement add(a, b)", "code", 10, "")] });
  mk("tests", { assignmentId: a3.id, name: "adds positive numbers", input: "2 3", expected: "5", points: 4, hidden: false });
  mk("tests", { assignmentId: a3.id, name: "adds negative numbers", input: "-2 -3", expected: "-5", points: 3, hidden: false });
  mk("tests", { assignmentId: a3.id, name: "handles zero", input: "0 7", expected: "7", points: 3, hidden: true });
  const answers = [
    ["Mitochondria", "Aerobic respiration happens in the mitochondria. Glucose and oxygen are used to make ATP, which supplies energy for the cell.", "True"],
    ["Mitochondria", "The mitochondria make ATP energy using glucose and oxygen so the cell can work.", "True"],
    ["Nucleus", "It is where the cell makes energy from sugar.", "True"],
    ["Mitochondria", "Respiration releases ATP in the mitochondria.", "False"],
    ["Mitochondria", "The mitochondria produce ATP energy from glucose and oxygen.", "True"],
    ["Ribosome", "Cells burn glucose.", "True"],
    ["Mitochondria", "", "True"],
  ];
  answers.forEach((a, i) => {
    const complete = i < 3;
    const sub: any = { assignmentId: a1.id, studentId: studs[i].id, status: complete ? "graded" : "submitted", submittedAt: now(), files: [], answers: { q1: a[0], q2: a[1], q3: a[2] }, grades: {}, approved: false, published: false, suggestions: {} };
    if (complete) {
      const sc = i === 0 ? [2, 5, 2] : i === 1 ? [2, 5, 2] : [0, 1, 2];
      sub.grades = { q1: { score: sc[0], comment: "" }, q2: { score: sc[1], comment: i === 2 ? "Name the organelle and the energy molecule." : "Clear and complete.", criteria: i === 2 ? { c1: 0, c2: 0, c3: 1 } : { c1: 2, c2: 2, c3: 1 } }, q3: { score: sc[2], comment: "" } };
      sub.score = sc[0] + sc[1] + sc[2]; sub.approved = true; sub.published = i < 2; sub.approvedBy = "Demonstration"; 
    }
    mk("submissions", sub);
  });
  mk("notifications", { userId: null, title: "Demonstration data loaded", body: "Sample records are labelled. Remove them from Settings when you are ready.", read: false });
  mk("audit", { actorName: "System", action: "workspace.created", detail: { demo: true } });
}
