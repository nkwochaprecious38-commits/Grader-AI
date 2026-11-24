"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Copy, Send } from "lucide-react";
import { PageHead, Spinner, Table, Modal, Field, Confirm, Empty, useCol, Badge, DemoTag, fdate, call, useToast } from "./ui";
import { useSession } from "./Shell";

export const TYPES = ["Examination", "Quiz", "Homework", "Problem set", "Essay", "Project", "Worksheet", "Bubble sheet assessment", "Programming assignment", "Group assignment", "Online assessment"];
const QTYPES: [string, string][] = [["mcq", "Multiple choice or true/false"], ["short", "Short answer"], ["essay", "Long answer or essay"], ["math", "Mathematical solution"], ["science", "Scientific explanation"], ["code", "Programming"]];
const blank = (type: string) => ({ title: "", courseId: "", type, instructions: "", status: "draft", release: "", due: "", late: "No late submissions", format: type === "Programming assignment" ? "Code" : type === "Bubble sheet assessment" ? "Scanned sheet" : "Online", language: "Python", rubricId: "", assignedTo: "all", questions: [{ id: "q1", prompt: "", type: type === "Bubble sheet assessment" ? "mcq" : "short", points: 1, key: "", options: "" }] });

export default function AssignmentsModule({ kind }: { kind: "assignments" | "examinations" }) {
  const s = useSession(); const c = useCol("assignments"); const courses = useCol("courses"); const rubrics = useCol("rubrics"); const subs = useCol("submissions");
  const [m, setM] = useState<any>(null); const [del, setDel] = useState<any>(null); const [mon, setMon] = useState<any>(null); const toast = useToast();
  const exam = kind === "examinations"; const canWrite = ["org_admin", "institution_admin", "instructor", "examiner"].includes(s.role);
  if (c.loading || courses.loading) return <Spinner />;
  const rows = c.rows.filter((a: any) => (a.type === "Examination" || a.type === "Bubble sheet assessment") === exam);
  const total = (a: any) => a.questions.reduce((n: number, q: any) => n + (Number(q.points) || 0), 0);
  async function save() {
    const a = m; if (!a.title.trim()) return toast("Enter a title.", "err"); if (!a.courseId) return toast("Select a course.", "err");
    if (!a.questions.length || a.questions.some((q: any) => !q.prompt.trim())) return toast("Every question needs a prompt.", "err");
    if (a.release && a.due && a.due < a.release) return toast("The due date cannot be before the release date.", "err");
    const body = { ...a, total: total(a), questions: a.questions.map((q: any, i: number) => ({ ...q, id: q.id || "q" + (i + 1), points: Number(q.points) || 0, options: q.options ? String(q.options).split(",").map((x: string) => x.trim()).filter(Boolean) : undefined, rubricId: q.rubricId || undefined })) };
    a.id ? await c.update(a.id, body) : await c.create(body, "Created as a draft. Publish it when you are ready."); setM(null);
  }
  const setQ = (i: number, p: any) => setM({ ...m, questions: m.questions.map((q: any, j: number) => (j === i ? { ...q, ...p } : q)) });
  return <>
    <PageHead title={exam ? "Examinations" : "Assignments"} sub={exam ? "Formal examinations and bubble sheet assessments." : "Quizzes, homework, problem sets, essays, projects, worksheets and programming assignments."}>
      {canWrite && <button className="btn-primary" onClick={() => setM(blank(exam ? "Examination" : "Homework"))}><Plus className="h-4 w-4" />{exam ? "Create examination" : "Create assignment"}</button>}</PageHead>
    {rows.length ? <Table head={["Title", "Course", "Type", "Marks", "Due", "Status", ""]}>{rows.map((a: any) => { const n = subs.rows.filter((x: any) => x.assignmentId === a.id).length;
      return <tr key={a.id}><td className="td font-medium">{a.title}{a.demo && <DemoTag />}</td><td className="td">{courses.rows.find((x: any) => x.id === a.courseId)?.code || "None"}</td><td className="td">{a.type}</td><td className="td">{a.total}</td><td className="td">{fdate(a.due)}</td>
        <td className="td"><Badge tone={a.status === "published" ? "green" : a.status === "closed" ? "grey" : "amber"}>{a.status}</Badge></td>
        <td className="td"><div className="flex justify-end gap-1.5"><button className="btn-ghost btn-sm" onClick={() => setMon(a)}>{n} submissions</button>
          {canWrite && <><button className="btn-ghost btn-sm" onClick={() => setM({ ...a, questions: a.questions.map((q: any) => ({ ...q, options: (q.options || []).join(", ") })) })}>Edit</button>
            <button className="btn-ghost btn-sm" aria-label="Duplicate" onClick={() => c.create({ ...a, title: a.title + " (copy)", status: "draft", demo: undefined }, "Duplicated as a draft.")}><Copy className="h-3.5 w-3.5" /></button>
            {a.status !== "published" ? <button className="btn-primary btn-sm" onClick={() => c.update(a.id, { status: "published" }, "Published. Enrolled students can now see it.")}><Send className="h-3.5 w-3.5" />Publish</button> : <button className="btn-ghost btn-sm" onClick={() => c.update(a.id, { status: "closed" }, "Closed to new submissions.")}>Close</button>}
            <button aria-label="Delete" className="btn-ghost btn-sm" onClick={() => setDel(a)}><Trash2 className="h-3.5 w-3.5" /></button></>}</div></td></tr>; })}</Table>
      : <div className="card"><Empty title={exam ? "No examinations yet" : "No assignments yet"} text="Create one with questions, an answer key and a rubric." /></div>}
    {exam && <BubbleTool assignments={rows.filter((a: any) => a.type === "Bubble sheet assessment")} onDone={() => subs.reload()} onSaveVersions={(id: string, versions: any) => c.update(id, { versions }, "Versions saved.")} />}

    <Modal open={!!m} onClose={() => setM(null)} title={m?.id ? "Edit assessment" : "New assessment"} wide>{m && <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }}>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Title"><input className="input" value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })} /></Field>
        <Field label="Course"><select className="input" value={m.courseId} onChange={(e) => setM({ ...m, courseId: e.target.value })}><option value="">Select a course</option>{courses.rows.filter((x: any) => !x.archived).map((x: any) => <option key={x.id} value={x.id}>{x.code} {x.title}</option>)}</select></Field>
        <Field label="Assessment type"><select className="input" value={m.type} onChange={(e) => setM({ ...m, type: e.target.value, format: e.target.value === "Programming assignment" ? "Code" : m.format })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Submission format"><select className="input" value={m.format} onChange={(e) => setM({ ...m, format: e.target.value })}>{["Online", "PDF or image upload", "Scanned paper", "Scanned sheet", "Code", "Mixed"].map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Release date"><input type="date" className="input" value={m.release} onChange={(e) => setM({ ...m, release: e.target.value })} /></Field>
        <Field label="Due date"><input type="date" className="input" value={m.due} onChange={(e) => setM({ ...m, due: e.target.value })} /></Field>
        <Field label="Late submission setting"><select className="input" value={m.late} onChange={(e) => setM({ ...m, late: e.target.value })}>{["No late submissions", "Accept until deadline only", "Accept with 10% daily penalty", "Accept late, flag for instructor"].map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Default grading rubric"><select className="input" value={m.rubricId} onChange={(e) => setM({ ...m, rubricId: e.target.value })}><option value="">None</option>{rubrics.rows.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
        {m.type === "Programming assignment" && <Field label="Language"><select className="input" value={m.language} onChange={(e) => setM({ ...m, language: e.target.value })}>{["Python", "JavaScript", "Java", "C++"].map((t) => <option key={t}>{t}</option>)}</select></Field>}
        <Field label="Assigned students" hint="Students enrolled in the selected course."><input className="input bg-soft" readOnly value="All enrolled students" /></Field></div>
      <Field label="Instructions"><textarea className="input" rows={3} value={m.instructions} onChange={(e) => setM({ ...m, instructions: e.target.value })} /></Field>
      <div><div className="mb-2 flex items-center justify-between"><h3 className="font-bold">Questions <span className="text-sm font-normal text-muted">Total marks: {total(m)}</span></h3><button type="button" className="btn-ghost btn-sm" onClick={() => setM({ ...m, questions: [...m.questions, { id: "q" + (m.questions.length + 1), prompt: "", type: m.type === "Bubble sheet assessment" ? "mcq" : "short", points: 1, key: "", options: "" }] })}><Plus className="h-3.5 w-3.5" />Add question</button></div>
        <div className="space-y-3">{m.questions.map((q: any, i: number) => <div key={i} className="rounded-xl border border-line p-3"><div className="flex items-center justify-between"><span className="text-xs font-bold text-teal">{q.id || "q" + (i + 1)}</span>{m.questions.length > 1 && <button type="button" aria-label="Remove question" onClick={() => setM({ ...m, questions: m.questions.filter((_: any, j: number) => j !== i) })}><Trash2 className="h-4 w-4 text-muted" /></button>}</div>
          <div className="mt-2 grid gap-3 sm:grid-cols-4"><div className="sm:col-span-3"><label className="label">Prompt</label><textarea className="input" rows={2} value={q.prompt} onChange={(e) => setQ(i, { prompt: e.target.value })} /></div>
            <div><label className="label">Marks</label><input className="input" type="number" min={0} step="0.5" value={q.points} onChange={(e) => setQ(i, { points: e.target.value })} /></div>
            <div><label className="label">Type</label><select className="input" value={q.type} onChange={(e) => setQ(i, { type: e.target.value })}>{QTYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            <div className="sm:col-span-2"><label className="label">Answer key {q.type !== "mcq" && <span className="font-normal text-muted">(key points separated by semicolons)</span>}</label><input className="input" value={q.key} onChange={(e) => setQ(i, { key: e.target.value })} /></div>
            {q.type === "mcq" && <div><label className="label">Options</label><input className="input" placeholder="A, B, C, D" value={q.options} onChange={(e) => setQ(i, { options: e.target.value })} /></div>}
            {["short", "essay", "math", "science"].includes(q.type) && <div className="sm:col-span-4"><label className="label">Rubric for this question</label><select className="input" value={q.rubricId || ""} onChange={(e) => setQ(i, { rubricId: e.target.value })}><option value="">Use default</option>{rubrics.rows.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>}</div></div>)}</div></div>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setM(null)}>Cancel</button><button className="btn-primary">Save assessment</button></div></form>}</Modal>
    <Modal open={!!mon} onClose={() => setMon(null)} title={mon ? `Submissions: ${mon.title}` : ""}>{mon && (() => { const l = subs.rows.filter((x: any) => x.assignmentId === mon.id); return <div className="space-y-2 text-sm">
      {[["Received", l.length], ["Awaiting approval", l.filter((x: any) => !x.approved).length], ["Approved", l.filter((x: any) => x.approved).length], ["Published", l.filter((x: any) => x.published).length]].map(([k, v]) => <div key={k as string} className="flex justify-between border-t border-line py-2 first:border-0"><span>{k}</span><strong>{v}</strong></div>)}
      <Link href="/app/submissions" className="btn-primary mt-3">Open submissions</Link></div>; })()}</Modal>
    <Confirm open={!!del} danger title="Delete assessment" text={`Delete ${del?.title}, its test cases and all of its submissions? This cannot be undone.`} confirmLabel="Delete" onClose={() => setDel(null)} onConfirm={() => c.remove(del.id)} />
  </>;
}

function BubbleTool({ assignments, onDone, onSaveVersions }: any) {
  const students = useCol("students"); const toast = useToast();
  const [aid, setAid] = useState(""); const [sid, setSid] = useState(""); const [ver, setVer] = useState("A"); const [resp, setResp] = useState<Record<string, string>>({}); const [unc, setUnc] = useState<string[]>([]); const [conf, setConf] = useState(false); const [res, setRes] = useState<any>(null);
  const a = assignments.find((x: any) => x.id === aid);
  const [vk, setVk] = useState<Record<string, string>>({});
  return <div className="card mt-8 p-5"><h2 className="text-lg font-bold">Bubble sheet and multiple choice scoring</h2>
    <p className="mt-1 text-sm text-muted">Automatic mark detection from scanned sheets is not configured on this server. Read each sheet, enter the marked letters below, flag any uncertain marks, and confirm them to score. Original scans can be uploaded from Submissions.</p>
    {!assignments.length ? <p className="mt-4 text-sm text-muted">Create an assessment of type Bubble sheet assessment to use this tool.</p> : <div className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-3"><Field label="Assessment"><select className="input" value={aid} onChange={(e) => { setAid(e.target.value); setResp({}); setUnc([]); setRes(null); }}><option value="">Select</option>{assignments.map((x: any) => <option key={x.id} value={x.id}>{x.title}</option>)}</select></Field>
        <Field label="Student"><select className="input" value={sid} onChange={(e) => setSid(e.target.value)}><option value="">Select</option>{students.rows.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
        <Field label="Version"><select className="input" value={ver} onChange={(e) => setVer(e.target.value)}>{["A", "B", "C", "D"].map((v) => <option key={v}>{v}</option>)}</select></Field></div>
      {a && <>
        {ver !== "A" && <div className="rounded-xl bg-soft p-3"><p className="mb-2 text-sm font-semibold">Answer key for version {ver}</p><div className="flex flex-wrap gap-2">{a.questions.map((q: any) => <label key={q.id} className="text-xs">{q.id}<input className="input ml-1 inline w-14 py-1" maxLength={2} defaultValue={a.versions?.[ver]?.[q.id] || ""} onChange={(e) => setVk({ ...vk, [q.id]: e.target.value })} /></label>)}</div><button className="btn-ghost btn-sm mt-2" onClick={() => onSaveVersions(a.id, { ...(a.versions || {}), [ver]: { ...(a.versions?.[ver] || {}), ...vk } })}>Save version key</button></div>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{a.questions.map((q: any) => <div key={q.id} className="rounded-xl border border-line p-2"><label className="text-xs font-bold text-teal">{q.id}</label><input className="input mt-1 py-1.5 uppercase" maxLength={2} value={resp[q.id] || ""} onChange={(e) => setResp({ ...resp, [q.id]: e.target.value })} aria-label={`Marked answer for ${q.id}`} /><label className="mt-1 flex items-center gap-1 text-[11px] text-muted"><input type="checkbox" className="accent-teal" checked={unc.includes(q.id)} onChange={(e) => setUnc(e.target.checked ? [...unc, q.id] : unc.filter((x) => x !== q.id))} />Uncertain</label></div>)}</div>
        {unc.length > 0 && <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-teal" checked={conf} onChange={(e) => setConf(e.target.checked)} />I have checked the uncertain marks ({unc.join(", ")}) against the sheet.</label>}
        <button className="btn-primary" onClick={async () => { if (!sid) return toast("Select a student.", "err"); try { const r = await call("/api/bubble", { body: { assignmentId: aid, studentId: sid, version: ver, responses: resp, uncertain: unc, confirmed: conf } }); setRes(r); onDone(); toast("Sheet scored. Review and approve it in the gradebook workflow."); } catch (e: any) { toast(e.message, "err"); } }}>Score sheet</button>
        {res && <p className="text-sm">Score: <strong>{res.score} of {res.total}</strong>. Open AI Grading to review and approve.</p>}</>}</div>}</div>;
}
