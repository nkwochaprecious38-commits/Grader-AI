"use client";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { PageHead, Spinner, Table, Modal, Badge, Empty, useData, fdate, call, useToast } from "@/components/ui";

export default function Assessments() {
  const { data, loading, reload } = useData<any>("/api/student/overview"); const toast = useToast();
  const [a, setA] = useState<any>(null); const [ans, setAns] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const files = useRef<HTMLInputElement>(null);
  if (loading) return <Spinner />;
  const sub = (id: string) => data.submissions.find((x: any) => x.assignmentId === id);
  const overdue = (x: any) => x.due && new Date() > new Date(x.due + "T23:59:59");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); const fd = new FormData(); fd.set("assignmentId", a.id); fd.set("answers", JSON.stringify(ans)); Array.from(files.current?.files || []).forEach((f) => fd.append("files", f)); setBusy(true);
    try { await call("/api/student/submit", { form: fd }); toast("Submitted. You can resubmit until your work is graded."); setA(null); reload(); } catch (er: any) { toast(er.message, "err"); } finally { setBusy(false); }
  }
  return <>
    <PageHead title="Assessments" sub="Submit typed answers, PDFs, images or code." />
    {data?.assignments.length ? <Table head={["Assessment", "Type", "Due", "Marks", "Status", ""]}>{data.assignments.map((x: any) => { const s = sub(x.id); return <tr key={x.id}><td className="td font-medium">{x.title}</td><td className="td">{x.type}</td><td className="td">{fdate(x.due)}{!s && overdue(x) && <> <Badge tone="red">Overdue</Badge></>}</td><td className="td">{x.total}</td>
      <td className="td">{s ? <Badge tone={s.published ? "green" : "teal"}>{s.published ? "Graded" : s.late ? "Submitted late" : "Submitted"}</Badge> : <Badge tone="amber">Not submitted</Badge>}</td>
      <td className="td text-right"><button className="btn-dark btn-sm" disabled={s?.published} onClick={() => { setA(x); setAns(s?.answers || {}); }}>{s ? (s.published ? "Closed" : "Edit submission") : "Start"}</button></td></tr>; })}</Table> : <div className="card"><Empty title="No assessments available" text="Published assessments for your courses appear here." /></div>}
    <Modal open={!!a} onClose={() => setA(null)} title={a?.title || ""} wide>{a && <form onSubmit={submit} className="space-y-5">
      <p className="text-sm text-muted">{a.instructions}</p><p className="text-xs text-muted">Due {fdate(a.due)}. Late policy: {a.late}.</p>
      {a.questions.map((q: any) => <div key={q.id} className="rounded-xl border border-line p-4"><p className="font-semibold text-sm"><span className="mr-2 text-teal">{q.id}</span>{q.prompt} <span className="font-normal text-muted">({q.points} marks)</span></p>
        {q.type === "mcq" ? (q.options?.length ? <div className="mt-2 flex flex-wrap gap-2">{q.options.map((o: string) => <label key={o} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${ans[q.id] === o ? "border-wint bg-mint" : "border-line"}`}><input type="radio" className="sr-only" name={q.id} checked={ans[q.id] === o} onChange={() => setAns({ ...ans, [q.id]: o })} />{o}</label>)}</div> : <input className="input mt-2" placeholder="Your answer" value={ans[q.id] || ""} onChange={(e) => setAns({ ...ans, [q.id]: e.target.value })} />)
          : <textarea className={`input mt-2 ${q.type === "code" ? "font-mono text-xs" : ""}`} rows={q.type === "code" ? 8 : 4} placeholder={q.type === "code" ? `Write your ${a.language || ""} code` : "Type your answer"} value={ans[q.id] || ""} onChange={(e) => setAns({ ...ans, [q.id]: e.target.value })} />}</div>)}
      <div><label className="label">Upload files (optional)</label><input ref={files} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.py,.js,.java,.cpp,.c,.ts" className="input" /><p className="mt-1 text-xs text-muted">PDF, PNG, JPG, WEBP or code files up to 10 MB each. Photos of handwritten work are accepted.</p></div>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setA(null)}>Cancel</button><button className="btn-primary" disabled={busy}><Upload className="h-4 w-4" />{busy ? "Submitting" : "Submit"}</button></div></form>}</Modal>
  </>;
}
