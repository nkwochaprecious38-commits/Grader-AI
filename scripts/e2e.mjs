// End to end checks against a running server: BASE=http://localhost:3100 node scripts/e2e.mjs
const BASE = process.env.BASE || "http://localhost:3000";
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : (fail++, console.log("FAIL:", m)); if (c) console.log("ok  :", m); };
class Client { jar = ""; async req(p, o = {}) { const r = await fetch(BASE + p, { redirect: "manual", method: o.json ? "POST" : "GET", ...o, headers: { ...(o.json ? { "content-type": "application/json" } : {}), cookie: this.jar, ...o.headers }, body: o.json ? JSON.stringify(o.json) : o.body });
  const sc = r.headers.getSetCookie?.() || []; for (const c of sc) { const [kv] = c.split(";"); const [k, v] = kv.split("="); const rest = this.jar.split("; ").filter((x) => x && !x.startsWith(k + "=")); this.jar = v ? [...rest, kv].join("; ") : rest.join("; "); }
  let j = null; try { j = await r.clone().json(); } catch {} return { s: r.status, j, r }; } }
const stamp = Date.now(); const email = `teacher${stamp}@gai-e2e.example.com`; const pw = "Passw0rdTest";
const T = new Client(), S = new Client(), X = new Client();

const su = { fullName: "Tara Teacher", email, organization: "Test School", orgType: "Secondary school", role: "Teacher", password: pw, confirm: pw, terms: true };
let r = await T.req("/api/auth/signup", { json: { ...su, terms: false } }); ok(r.s === 400, "signup rejects unaccepted terms: " + r.j?.error);
r = await T.req("/api/auth/signup", { json: { ...su, confirm: "different1" } }); ok(r.s === 400 && /match/.test(r.j.error), "signup rejects mismatched passwords");
r = await T.req("/api/auth/signup", { json: { ...su, password: "short1", confirm: "short1" } }); ok(r.s === 400, "signup rejects weak password: " + r.j?.error);
r = await T.req("/api/auth/signup", { json: { ...su, email: "not-an-email" } }); ok(r.s === 400, "signup rejects bad email");
r = await T.req("/api/auth/signup", { json: su }); ok(r.s === 200 && r.j.redirect === "/app", "signup succeeds and returns redirect");
r = await T.req("/app"); ok(r.s === 200, "dashboard loads after signup");
r = await new Client().req("/api/auth/signup", { json: su }); ok(r.s === 409, "duplicate email rejected: " + r.j?.error);
r = await new Client().req("/app"); ok(r.s === 307 && /\/login/.test(r.r.headers.get("location")), "dashboard route protected (redirects to login)");
r = await new Client().req("/api/data/courses"); ok(r.s === 401, "API requires session");

const L = new Client();
r = await L.req("/api/auth/login", { json: { email, password: "WrongPass1" } }); ok(r.s === 401 && /Incorrect/.test(r.j.error), "login rejects wrong password");
r = await L.req("/api/auth/login", { json: { email: "nobody@x.com", password: "WrongPass1" } }); ok(r.s === 401 && /Incorrect/.test(r.j.error), "login gives same error for unknown email");
r = await L.req("/api/auth/login", { json: { email: email.toUpperCase(), password: pw, remember: true } }); ok(r.s === 200, "login works (email case insensitive)");
ok(/gai_session/.test(L.jar), "session cookie set");
r = await L.req("/api/auth/me"); ok(r.j?.role === "org_admin" && r.j.user.email === email, "me returns org admin session");
r = await L.req("/api/auth/logout", { method: "POST" }); r = await L.req("/api/auth/me"); ok(r.s === 401, "logout clears session");

// password reset
r = await new Client().req("/api/auth/forgot", { json: { email } }); ok(r.s === 200 && r.j.devLink, "forgot password returns dev link");
const token = new URL(r.j.devLink).searchParams.get("token");
r = await new Client().req("/api/auth/reset", { json: { token: "bogus-token-123", password: "NewPassw0rd", confirm: "NewPassw0rd" } }); ok(r.s === 400, "reset rejects bad token");
r = await new Client().req("/api/auth/reset", { json: { token, password: "NewPassw0rd", confirm: "NewPassw0rd" } }); ok(r.s === 200, "reset with valid token");
r = await new Client().req("/api/auth/reset", { json: { token, password: "Another1Pass", confirm: "Another1Pass" } }); ok(r.s === 400, "reset token is single use");
r = await new Client().req("/api/auth/login", { json: { email, password: pw } }); ok(r.s === 401, "old password no longer works");
r = await T.req("/api/auth/login", { json: { email, password: "NewPassw0rd" } }); ok(r.s === 200, "new password works");
r = await new Client().req("/api/auth/forgot", { json: { email: "ghost@x.com" } }); ok(r.s === 200 && !r.j.devLink, "forgot does not reveal unknown accounts");

// workspace data (demo seeded)
r = await T.req("/api/overview"); ok(r.j.demo === true && r.j.courses === 2, "demo data seeded and flagged");
const courses = (await T.req("/api/data/courses")).j; const students = (await T.req("/api/data/students")).j; const asgs = (await T.req("/api/data/assignments")).j;
const quiz = asgs.find((a) => a.title === "Cell Biology Quiz");

// invite student; student isolation
const semail = `stu${stamp}@gai-e2e.example.com`;
r = await T.req("/api/data/students", { json: { name: "Stu Dent", email: semail, courseIds: [courses[0].id] } }); const stu = r.j; ok(r.s === 201, "create student record");
r = await T.req("/api/team", { json: { email: semail, role: "student", studentId: stu.id } }); ok(r.s === 200 && r.j.link, "invite student");
const inv = new URL(r.j.link).searchParams.get("invite");
r = await new Client().req("/api/auth/signup", { json: { ...su, email: "other@gai-e2e.example.com", invite: inv, fullName: "Eve", organization: "x", orgType: "x", role: "x" } }); ok(r.s === 400 && /sent to/.test(r.j.error), "invite bound to email");
r = await S.req("/api/auth/signup", { json: { fullName: "Stu Dent", email: semail, organization: "x", orgType: "x", role: "Student", password: pw, confirm: pw, terms: true, invite: inv } }); ok(r.s === 200, "student signs up via invite");
r = await S.req("/api/auth/me"); ok(r.j.role === "student" && r.j.studentId === stu.id, "student linked to record");
r = await S.req("/api/data/submissions"); ok(r.s === 403, "student cannot use staff data API");
r = await S.req("/api/data/submissions", { json: { x: 1 } }); ok(r.s === 403, "student cannot write via generic API");
r = await S.req("/api/analytics"); ok(r.s === 403, "student blocked from analytics");
r = await S.req("/api/student/overview"); ok(r.j.assignments.some((a) => a.id === quiz.id) && r.j.submissions.length === 0, "student sees only own data");
ok(!JSON.stringify(r.j).includes("demo.student"), "no other students leaked");
ok(!JSON.stringify(r.j.assignments).includes("Mitochondria"), "answer keys not sent to students");
const fd = new FormData(); fd.set("assignmentId", quiz.id); fd.set("answers", JSON.stringify({ q1: "Mitochondria", q2: "Mitochondria make ATP energy from glucose and oxygen.", q3: "True" }));
r = await S.req("/api/student/submit", { method: "POST", body: fd }); ok(r.s === 200, "student submits: " + (r.j?.error || ""));
const bad = new FormData(); bad.set("assignmentId", quiz.id); bad.set("answers", "{}"); bad.append("files", new File(["x"], "evil.exe"));
r = await S.req("/api/student/submit", { method: "POST", body: bad }); ok(r.s === 400, "dangerous file type rejected");

// grading guard flow
const subs = (await T.req("/api/data/submissions")).j; const mine = subs.find((s) => s.studentId === stu.id);
r = await T.req("/api/ai/suggest", { json: { submissionIds: [mine.id] } }); ok(r.s === 200, "AI suggestions generated");
let cur = (await T.req("/api/data/submissions")).j.find((s) => s.id === mine.id);
ok(cur.suggestions.q1.score === 2 && cur.suggestions.q2.rubricMap.length === 3 && !cur.approved && !cur.published, "suggestions stored, nothing approved or published");
r = await T.req(`/api/data/submissions/${mine.id}`, { method: "PATCH", json: { published: true } }); ok(r.s === 400 && /approved/.test(r.j.error), "cannot publish unapproved grade");
r = await T.req(`/api/data/submissions/${mine.id}`, { method: "PATCH", json: { grades: { q1: { score: 99 } } } }); ok(r.s === 400, "score above max rejected");
const g = { q1: { score: 2 }, q2: { score: 4, comment: "Good", criteria: { c1: 2, c2: 2, c3: 0 } }, q3: { score: 2 } };
r = await T.req(`/api/data/submissions/${mine.id}`, { method: "PATCH", json: { grades: g } }); ok(r.s === 200 && r.j.score === 8, "marks saved, total derived server side");
r = await S.req("/api/student/overview"); ok(r.j.submissions[0].grades === undefined && !r.j.submissions[0].published, "student cannot see unpublished grades");
r = await T.req(`/api/data/submissions/${mine.id}`, { method: "PATCH", json: { approved: true } }); ok(r.s === 200 && r.j.approved, "instructor approves");
r = await T.req(`/api/data/submissions/${mine.id}`, { method: "PATCH", json: { published: true } }); ok(r.s === 200, "publish after approval");
r = await S.req("/api/student/overview"); ok(r.j.submissions[0].score === 8 && r.j.submissions[0].grades.q2.comment === "Good", "student sees published grade");
ok(!JSON.stringify(r.j.submissions).includes("suggestions"), "AI suggestions hidden from student");
r = await S.req("/api/student/regrade", { json: { submissionId: mine.id, questionId: "q2", type: "regrade", reason: "I mentioned glucose and oxygen." } }); ok(r.s === 201, "student requests regrade");
const other = subs.find((s) => s.studentId !== stu.id);
r = await S.req("/api/student/regrade", { json: { submissionId: other.id, type: "regrade", reason: "Trying someone elses work" } }); ok(r.s === 404, "student cannot query another student's submission");
const rg = (await T.req("/api/data/regrades")).j[0];
r = await T.req("/api/regrade-resolve", { json: { id: rg.id, decision: "adjusted", response: "You are right.", newScore: 5 } }); ok(r.s === 200, "instructor adjusts grade via regrade");
cur = (await T.req("/api/data/submissions")).j.find((s) => s.id === mine.id); ok(cur.score === 9, "total recalculated after regrade");
const audit = (await T.req("/api/data/audit")).j; ok(audit.filter((a) => a.action === "grade.changed").length >= 3, "audit log records grade changes");
r = await S.req("/api/data/audit"); ok(r.s === 403, "student cannot read audit log");

// roles: TA cannot approve
const taMail = `ta${stamp}@gai-e2e.example.com`; r = await T.req("/api/team", { json: { email: taMail, role: "ta" } }); const tinv = new URL(r.j.link).searchParams.get("invite");
await X.req("/api/auth/signup", { json: { ...su, email: taMail, fullName: "Tia TA", invite: tinv, organization: "x", orgType: "x" } });
const sub2 = subs.find((s) => s.studentId !== stu.id && !s.approved);
r = await X.req(`/api/data/submissions/${sub2.id}`, { method: "PATCH", json: { approved: true, grades: { q1: { score: 1 } } } }); ok(r.s === 403, "TA cannot approve grades");
r = await X.req("/api/team"); ok(r.s === 403, "TA cannot manage team");
r = await X.req("/api/integrations/test", { json: { id: "x" } }); ok(r.s === 403, "TA cannot touch integrations");

// org isolation
const T2 = new Client(); await T2.req("/api/auth/signup", { json: { ...su, email: `other${stamp}@gai-e2e.example.com`, organization: "Other Org" } });
r = await T2.req(`/api/data/submissions/${mine.id}`, { method: "PATCH", json: { published: false } }); ok(r.s === 404, "other organization cannot modify records");
r = await T2.req(`/api/files/anything`); ok(r.s === 404, "files not accessible cross org");
ok(!(JSON.stringify((await T2.req("/api/data/students")).j)).includes("Stu Dent"), "other organization cannot read students");

// misc modules
r = await T.req("/api/ai/assistant", { json: { q: "Which questions had the lowest average scores?" } }); ok(r.s === 200 && r.j.observed.length, "assistant answers from data");
r = await T.req("/api/ai/group", { json: { assignmentId: quiz.id, questionId: "q2" } }); ok(r.s === 200 && Array.isArray(r.j.groups), "answer grouping runs");
r = await T.req("/api/sandbox", { json: { submissionId: mine.id } }); ok(r.s === 503, "sandbox refuses when not configured (no local execution)");
r = await T.req("/api/workspace", { method: "DELETE" }); ok(r.s === 200 && r.j.removed > 10, "demo data removable");
for (const p of ["/", "/platform", "/solutions", "/features", "/pricing", "/login", "/signup", "/forgot-password", "/terms"]) { r = await new Client().req(p); ok(r.s === 200, "public page " + p); }
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
