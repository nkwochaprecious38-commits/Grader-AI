"use client";
import { useState } from "react";
import { PageHead, Spinner, Modal, Empty, Badge, useData, call, useToast, Field } from "@/components/ui";

export default function Grades() {
  const { data, loading, reload } = useData<any>("/api/student/overview"); const toast = useToast(); const [r, setR] = useState<any>(null);
  if (loading) return <Spinner />;
  const items = data.submissions.filter((x: any) => x.published); const A = (id: string) => data.assignments.find((a: any) => a.id === id);
  async function send() { if ((r.reason || "").trim().length < 10) return toast("Explain your concern in at least 10 characters.", "err"); try { await call("/api/student/regrade", { body: { submissionId: r.sub.id, questionId: r.q || undefined, type: r.type, reason: r.reason } }); toast("Request sent. Track it under Regrade Requests."); setR(null); reload(); } catch (e: any) { toast(e.message, "err"); } }
  return <>
    <PageHead title="Grades and Feedback" sub="Only results your instructor has published appear here." />
    {items.length ? <div className="space-y-5">{items.map((s: any) => { const a = A(s.assignmentId); const rub = data.rubrics.find((x: any) => x.id === a?.rubricId); return <div key={s.id} className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">{a?.title}</h2><p className="text-sm text-muted">{a?.type}</p></div><div className="text-right"><p className="font-head text-3xl font-extrabold text-teal-deep">{s.score} <span className="text-base font-semibold text-muted">of {a?.total}</span></p><p className="text-xs text-muted">{a?.total ? Math.round((s.score / a.total) * 100) : 0}%</p></div></div>
      <div className="mt-4 space-y-3">{(a?.questions || []).map((q: any) => { const g = s.grades?.[q.id]; return <div key={q.id} className="rounded-xl bg-soft p-3 text-sm"><div className="flex justify-between gap-3"><p><strong className="text-teal">{q.id}</strong> {q.prompt}</p><Badge tone={g && g.score >= q.points ? "green" : "amber"}>{g?.score ?? "n/a"} of {q.points}</Badge></div>
        <p className="mt-1 text-xs text-muted">Your answer: {s.answers?.[q.id] || "File submission"}</p>{g?.comment && <p className="mt-1">Feedback: {g.comment}</p>}
        {g?.criteria && rub && <p className="mt-1 text-xs text-muted">Rubric: {rub.criteria.map((c: any) => `${c.label} ${g.criteria[c.id] ?? 0} of ${c.points}`).join(" · ")}</p>}
        <button className="mt-2 text-xs font-semibold text-teal underline" onClick={() => setR({ sub: s, q: q.id, type: "regrade", reason: "", title: `${a.title}: ${q.id}` })}>Ask about this mark</button></div>; })}</div>
      {s.feedback && <div className="mt-4 space-y-2 rounded-xl bg-mint-pale p-4 text-sm">{[["General feedback", s.feedback.general], ["Strengths", s.feedback.strengths], ["Areas to improve", s.feedback.weaknesses], ["Suggested corrections", s.feedback.corrections], ["Recommendations", s.feedback.improvements]].filter(([, v]) => v).map(([k, v]) => <p key={k as string}><strong>{k}:</strong> {v}</p>)}{s.feedback.annotations?.map((n: any, i: number) => <p key={i} className="text-xs text-muted">Note on {n.q}: {n.text}</p>)}</div>}</div>; })}</div> : <div className="card"><Empty title="No published results yet" text="You will be notified when a grade is published." /></div>}
    <Modal open={!!r} onClose={() => setR(null)} title="Ask your instructor">{r && <div className="space-y-4"><p className="text-sm text-muted">{r.title}</p>
      <Field label="Request type"><select className="input" value={r.type} onChange={(e) => setR({ ...r, type: e.target.value })}><option value="regrade">Regrade request</option><option value="clarification">Request clarification</option></select></Field>
      <Field label="Explain your concern"><textarea className="input" rows={4} value={r.reason} onChange={(e) => setR({ ...r, reason: e.target.value })} /></Field>
      <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={() => setR(null)}>Cancel</button><button className="btn-primary" onClick={send}>Send request</button></div></div>}</Modal>
  </>;
}
