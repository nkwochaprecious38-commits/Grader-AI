"use client";
import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { PageHead, Spinner, Table, Modal, Field, Empty, useCol, Badge, DemoTag } from "@/components/ui";
import { useSession } from "@/components/Shell";
import { APPROVERS } from "@/lib/roles";

export default function Feedback() {
  const s = useSession(); const c = useCol("submissions"); const asg = useCol("assignments"); const st = useCol("students");
  const [open, setOpen] = useState<any>(null);
  if (c.loading || asg.loading) return <Spinner />;
  const rows = c.rows.filter((r: any) => r.grades && Object.keys(r.grades).length);
  return <>
    <PageHead title="Feedback" sub="Write feedback beyond the marks. It reaches students only when the grade is published." />
    {rows.length ? <Table head={["Student", "Assignment", "Feedback", "Status", ""]}>{rows.map((r: any) => <tr key={r.id}><td className="td font-medium">{st.rows.find((x: any) => x.id === r.studentId)?.name}{r.demo && <DemoTag />}</td><td className="td">{asg.rows.find((a: any) => a.id === r.assignmentId)?.title}</td>
      <td className="td">{r.feedback?.general || r.feedback?.strengths ? <Badge tone="green">Written</Badge> : <Badge>None</Badge>}</td><td className="td"><Badge tone={r.published ? "green" : r.approved ? "teal" : "amber"}>{r.published ? "Published" : r.approved ? "Approved" : "Draft"}</Badge></td>
      <td className="td text-right"><button className="btn-dark btn-sm" onClick={() => setOpen(r)}>Open</button></td></tr>)}</Table>
      : <div className="card"><Empty title="No scored work yet" text="Score a submission in AI Grading to add feedback here." /></div>}
    {open && <Editor sub={c.rows.find((x: any) => x.id === open.id)} a={asg.rows.find((a: any) => a.id === open.assignmentId)} student={st.rows.find((x: any) => x.id === open.studentId)?.name} c={c} role={s.role} onClose={() => setOpen(null)} />}
  </>;
}
function Editor({ sub, a, student, c, role, onClose }: any) {
  const [f, setF] = useState<any>({ general: "", strengths: "", weaknesses: "", improvements: "", corrections: "", annotations: [], ...(sub.feedback || {}) });
  const [note, setNote] = useState({ q: a?.questions?.[0]?.id || "", text: "" });
  return <Modal open onClose={onClose} title={`Feedback: ${student}`} wide><div className="space-y-4">
    <div className="rounded-xl bg-soft p-3 text-sm"><p className="mb-1 text-xs font-semibold text-muted">Rubric based comments from grading</p>{Object.entries<any>(sub.grades).map(([q, g]) => <p key={q}><strong>{q}</strong>: {g.score} marks{g.comment ? `. ${g.comment}` : ""}</p>)}</div>
    <Field label="General feedback"><textarea className="input" rows={3} value={f.general} onChange={(e) => setF({ ...f, general: e.target.value })} /></Field>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Strengths"><textarea className="input" rows={3} value={f.strengths} onChange={(e) => setF({ ...f, strengths: e.target.value })} /></Field><Field label="Weaknesses"><textarea className="input" rows={3} value={f.weaknesses} onChange={(e) => setF({ ...f, weaknesses: e.target.value })} /></Field>
      <Field label="Suggested corrections"><textarea className="input" rows={3} value={f.corrections} onChange={(e) => setF({ ...f, corrections: e.target.value })} /></Field><Field label="Improvement recommendations"><textarea className="input" rows={3} value={f.improvements} onChange={(e) => setF({ ...f, improvements: e.target.value })} /></Field></div>
    <div><p className="label">Inline annotations</p>{f.annotations.map((n: any, i: number) => <div key={i} className="mb-1 flex items-center justify-between rounded-lg bg-mint-pale px-3 py-2 text-sm"><span><strong>{n.q}</strong>: {n.text}</span><button className="text-xs text-bad" onClick={() => setF({ ...f, annotations: f.annotations.filter((_: any, j: number) => j !== i) })}>Remove</button></div>)}
      <div className="mt-2 flex gap-2"><select className="input w-28" aria-label="Question" value={note.q} onChange={(e) => setNote({ ...note, q: e.target.value })}>{(a?.questions || []).map((q: any) => <option key={q.id}>{q.id}</option>)}</select><input className="input" placeholder="Note tied to this answer" value={note.text} onChange={(e) => setNote({ ...note, text: e.target.value })} /><button className="btn-ghost" disabled={!note.text.trim()} onClick={() => { setF({ ...f, annotations: [...f.annotations, note] }); setNote({ ...note, text: "" }); }}><Plus className="h-4 w-4" /></button></div></div>
    <div className="flex flex-wrap justify-end gap-2"><button className="btn-ghost" onClick={async () => { await c.update(sub.id, { feedback: f }, "Feedback saved."); }}>Save draft</button>
      {APPROVERS.includes(role) && <button className="btn-primary" disabled={!sub.approved} title={sub.approved ? "" : "Approve the grade first"} onClick={async () => { await c.update(sub.id, { feedback: f, published: true }, "Grade and feedback published."); onClose(); }}><Send className="h-4 w-4" />Save and publish</button>}</div>
    {!sub.approved && <p className="text-right text-xs text-muted">Approve the grade in AI Grading before publishing.</p>}
  </div></Modal>;
}
