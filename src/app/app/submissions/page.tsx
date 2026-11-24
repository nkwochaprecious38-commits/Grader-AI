"use client";
import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Eye } from "lucide-react";
import { PageHead, Spinner, Table, Modal, Field, Empty, useCol, Badge, DemoTag, fdate, call, useToast, useData } from "@/components/ui";
import { useSession } from "@/components/Shell";
import { subStatus } from "@/lib/status";

export default function Submissions() {
  const s = useSession(); const c = useCol("submissions"); const asg = useCol("assignments"); const st = useCol("students"); const staff = useData<any[]>("/api/staff"); const toast = useToast();
  const [fa, setFa] = useState(""); const [fs, setFs] = useState(""); const [up, setUp] = useState<any>(null); const [view, setView] = useState<any>(null); const [busy, setBusy] = useState(false); const files = useRef<HTMLInputElement>(null);
  if (c.loading || asg.loading || st.loading) return <Spinner />;
  const name = (id: string) => st.rows.find((x: any) => x.id === id)?.name || "Unknown student";
  const title = (id: string) => asg.rows.find((x: any) => x.id === id)?.title || "Unknown";
  const rows = c.rows.filter((r: any) => (!fa || r.assignmentId === fa) && (!fs || subStatus(r).label === fs)).sort((a: any, b: any) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  async function upload(e: React.FormEvent) {
    e.preventDefault(); const fd = new FormData(); fd.set("assignmentId", up.assignmentId || ""); fd.set("studentId", up.studentId || ""); fd.set("text", up.text || "");
    Array.from(files.current?.files || []).forEach((f) => fd.append("files", f)); setBusy(true);
    try { await call("/api/upload", { form: fd }); toast("Submission received."); setUp(null); c.reload(); } catch (er: any) { toast(er.message, "err"); } finally { setBusy(false); }
  }
  return <>
    <PageHead title="Submissions" sub="Receive, review and assign student work. Upload scanned papers, PDFs and images on behalf of students.">
      <select className="input w-48" aria-label="Filter by assignment" value={fa} onChange={(e) => setFa(e.target.value)}><option value="">All assignments</option>{asg.rows.map((a: any) => <option key={a.id} value={a.id}>{a.title}</option>)}</select>
      <select className="input w-44" aria-label="Filter by status" value={fs} onChange={(e) => setFs(e.target.value)}><option value="">All statuses</option>{["Awaiting grading", "AI suggested", "Manual review", "Needs transcription", "Approved", "Published"].map((x) => <option key={x}>{x}</option>)}</select>
      <button className="btn-primary" onClick={() => setUp({})}><Upload className="h-4 w-4" />Upload work</button></PageHead>
    {rows.length ? <Table head={["Student", "Assignment", "Submitted", "Files", "Status", "Assigned to", ""]}>{rows.map((r: any) => { const b = subStatus(r); return <tr key={r.id}>
      <td className="td font-medium">{name(r.studentId)}{r.demo && <DemoTag />}</td><td className="td">{title(r.assignmentId)}</td><td className="td">{fdate(r.submittedAt)}{r.late && <> <Badge tone="amber">Late</Badge></>}</td><td className="td">{(r.files || []).length}</td><td className="td"><Badge tone={b.tone}>{b.label}</Badge></td>
      <td className="td"><select className="input w-36 py-1.5 text-xs" aria-label="Assign grader" value={r.assignedTo || ""} onChange={(e) => c.update(r.id, { assignedTo: e.target.value, assignedName: staff.data?.find((x) => x.id === e.target.value)?.name }, "Assigned for grading.")}><option value="">Unassigned</option>{(staff.data || []).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></td>
      <td className="td text-right"><button className="btn-ghost btn-sm" onClick={() => setView(r)}><Eye className="h-3.5 w-3.5" />Review</button></td></tr>; })}</Table>
      : <div className="card"><Empty title="No submissions yet" text="Students submit from their portal, or you can upload work for them." /></div>}
    <Modal open={!!up} onClose={() => setUp(null)} title="Upload student work">{up && <form onSubmit={upload} className="space-y-4">
      <Field label="Assignment"><select className="input" required value={up.assignmentId || ""} onChange={(e) => setUp({ ...up, assignmentId: e.target.value })}><option value="">Select</option>{asg.rows.map((a: any) => <option key={a.id} value={a.id}>{a.title}</option>)}</select></Field>
      <Field label="Student" hint="Work is associated with the student you choose."><select className="input" required value={up.studentId || ""} onChange={(e) => setUp({ ...up, studentId: e.target.value })}><option value="">Select</option>{st.rows.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
      <Field label="Files" hint="PDF, PNG, JPG, WEBP or code files up to 4 MB in total per upload. Multi page PDFs are supported."><input ref={files} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.py,.js,.java,.cpp,.c,.ts" className="input" /></Field>
      <Field label="Typed answer (optional, applied to question 1)"><textarea className="input" rows={3} value={up.text || ""} onChange={(e) => setUp({ ...up, text: e.target.value })} /></Field>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setUp(null)}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? "Uploading" : "Upload"}</button></div></form>}</Modal>
    {view && <Review sub={c.rows.find((x: any) => x.id === view.id) || view} asg={asg.rows.find((a: any) => a.id === view.assignmentId)} student={name(view.studentId)} onClose={() => setView(null)} c={c} />}
  </>;
}

function Review({ sub, asg, student, onClose, c }: any) {
  const [ans, setAns] = useState<Record<string, string>>(sub.answers || {}); const [file, setFile] = useState(sub.files?.[0]);
  useEffect(() => setAns(sub.answers || {}), [sub.id]);
  const locked = sub.approved;
  return <Modal open onClose={onClose} title={`${student}: ${asg?.title || ""}`} wide><div className="grid gap-5 lg:grid-cols-2">
    <div><h3 className="mb-2 text-sm font-bold">Original submission</h3>
      {(sub.files || []).length ? <><div className="mb-2 flex flex-wrap gap-2">{sub.files.map((f: any) => <button key={f.id} onClick={() => setFile(f)} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${file?.id === f.id ? "border-wint bg-mint-pale" : "border-line"}`}><FileText className="h-3.5 w-3.5" />{f.name}</button>)}</div>
        {file && (file.type?.startsWith("image/") ? <img alt={file.name} src={`/api/files/${file.id}`} className="max-h-[420px] w-full rounded-xl border border-line object-contain" /> : file.type === "application/pdf" ? <iframe title={file.name} src={`/api/files/${file.id}`} className="h-[420px] w-full rounded-xl border border-line" /> : <a className="btn-ghost" href={`/api/files/${file.id}`} target="_blank">Open {file.name}</a>)}</> : <p className="rounded-xl bg-soft p-4 text-sm text-muted">No files. This was submitted as typed answers.</p>}</div>
    <div><h3 className="mb-1 text-sm font-bold">Answer text</h3>
      {(sub.files || []).length > 0 && <p className="mb-2 rounded-lg bg-[#FCF1DC] p-2 text-xs text-[#6F4708]">Automatic handwriting recognition is not configured on this server, so no text has been extracted. Read the original and type the answer. If writing cannot be read reliably, flag it for manual review instead of guessing.</p>}
      <div className="space-y-3">{(asg?.questions || []).map((q: any) => <div key={q.id}><label className="label text-xs">{q.id}: {q.prompt.slice(0, 70)}</label><textarea disabled={locked} className="input" rows={2} value={ans[q.id] || ""} onChange={(e) => setAns({ ...ans, [q.id]: e.target.value })} /></div>)}</div>
      {!locked && <div className="mt-4 flex flex-wrap gap-2"><button className="btn-primary" onClick={async () => { await c.update(sub.id, { answers: ans, needsTranscription: false, manualReview: false, suggestions: {} }, "Transcription saved. Generate suggestions from AI Grading."); }}>Save transcription</button>
        <button className="btn-ghost" onClick={() => c.update(sub.id, { manualReview: true, manualReason: "Handwriting could not be read reliably." }, "Flagged for manual review.")}>Flag unreadable for manual review</button></div>}
      {sub.manualReview && <p className="mt-3 text-xs text-bad">Flagged: {sub.manualReason}</p>}</div></div></Modal>;
}
