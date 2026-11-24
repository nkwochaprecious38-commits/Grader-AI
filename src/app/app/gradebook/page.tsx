"use client";
import { useState } from "react";
import { Download, Send, Pencil } from "lucide-react";
import { PageHead, Spinner, Table, Modal, Field, Empty, useCol, Badge, DemoTag, useToast, Confirm } from "@/components/ui";
import { useSession } from "@/components/Shell";
import { APPROVERS } from "@/lib/roles";

export default function Gradebook() {
  const s = useSession(); const c = useCol("submissions"); const asg = useCol("assignments"); const st = useCol("students"); const toast = useToast();
  const [fa, setFa] = useState(""); const [edit, setEdit] = useState<any>(null); const [pub, setPub] = useState(false);
  const canEdit = APPROVERS.includes(s.role);
  if (c.loading || asg.loading || st.loading) return <Spinner />;
  const A = (id: string) => asg.rows.find((a: any) => a.id === id); const S = (id: string) => st.rows.find((x: any) => x.id === id);
  const rows = c.rows.filter((r: any) => !fa || r.assignmentId === fa).map((r: any) => { const a = A(r.assignmentId); const sc = r.override ?? r.score; return { r, a, student: S(r.studentId)?.name || "Unknown", score: sc, total: a?.total, pct: sc != null && a?.total ? (sc / a.total) * 100 : null }; }).sort((x: any, y: any) => x.student.localeCompare(y.student));
  const toPublish = rows.filter((x: any) => x.r.approved && !x.r.published);
  const csv = () => { const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`; const out = [["Student", "Assignment", "Score", "Total marks", "Percentage", "Grading status", "Publication status"], ...rows.map((x: any) => [x.student, x.a?.title, x.score ?? "", x.total ?? "", x.pct == null ? "" : x.pct.toFixed(1), x.r.approved ? "Approved" : "Not approved", x.r.published ? "Published" : "Unpublished"])].map((l) => l.map(esc).join(",")).join("\n");
    const u = URL.createObjectURL(new Blob([out], { type: "text/csv" })); const el = document.createElement("a"); el.href = u; el.download = "gradebook.csv"; el.click(); URL.revokeObjectURL(u); toast("Gradebook exported."); };
  return <>
    <PageHead title="Gradebook" sub="Scores, grading status and publication status. Only approved grades can be published.">
      <select className="input w-52" aria-label="Filter by assignment" value={fa} onChange={(e) => setFa(e.target.value)}><option value="">All assignments</option>{asg.rows.map((a: any) => <option key={a.id} value={a.id}>{a.title}</option>)}</select>
      <button className="btn-ghost" onClick={csv} disabled={!rows.length}><Download className="h-4 w-4" />Export CSV</button>
      {canEdit && <button className="btn-primary" disabled={!toPublish.length} onClick={() => setPub(true)}><Send className="h-4 w-4" />Publish approved ({toPublish.length})</button>}</PageHead>
    {rows.length ? <Table head={["Student", "Assignment", "Score", "Total marks", "Percentage", "Grading", "Publication", ""]}>{rows.map((x: any) => <tr key={x.r.id}>
      <td className="td font-medium">{x.student}{x.r.demo && <DemoTag />}</td><td className="td">{x.a?.title}</td><td className="td">{x.score ?? "n/a"}{x.r.override != null && <span className="ml-1 text-xs text-muted">(edited)</span>}</td><td className="td">{x.total}</td><td className="td">{x.pct == null ? "n/a" : x.pct.toFixed(1) + "%"}</td>
      <td className="td"><Badge tone={x.r.approved ? "green" : x.score != null ? "amber" : "grey"}>{x.r.approved ? "Approved" : x.score != null ? "Needs approval" : "Not graded"}</Badge></td>
      <td className="td"><Badge tone={x.r.published ? "green" : "grey"}>{x.r.published ? "Published" : "Unpublished"}</Badge></td>
      <td className="td text-right">{canEdit && <div className="flex justify-end gap-1.5"><button className="btn-ghost btn-sm" onClick={() => setEdit({ ...x, newScore: x.score ?? "", reason: "" })}><Pencil className="h-3.5 w-3.5" />Edit</button>{x.r.approved && <button className="btn-ghost btn-sm" onClick={() => c.update(x.r.id, { published: !x.r.published }, x.r.published ? "Unpublished." : "Published to the student.")}>{x.r.published ? "Unpublish" : "Publish"}</button>}</div>}</td></tr>)}</Table>
      : <div className="card"><Empty title="No grade records yet" text="Records appear here once submissions are received." /></div>}
    <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit total score">{edit && <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); const n = Number(edit.newScore); if (!Number.isFinite(n) || n < 0 || n > edit.total) return toast(`Score must be between 0 and ${edit.total}.`, "err"); if (!edit.reason.trim()) return toast("Enter a reason. It is recorded in the audit log.", "err"); await c.update(edit.r.id, { override: n, overrideReason: edit.reason }, "Score updated and logged."); setEdit(null); }}>
      <p className="text-sm text-muted">{edit.student}: {edit.a?.title}. Question marks: {edit.r.score ?? "none"}. Editing sets the total used in the gradebook and is recorded in the audit log.</p>
      <Field label={`Total score (max ${edit.total})`}><input type="number" step="0.5" className="input" value={edit.newScore} onChange={(e) => setEdit({ ...edit, newScore: e.target.value })} /></Field>
      <Field label="Reason for change"><input className="input" value={edit.reason} onChange={(e) => setEdit({ ...edit, reason: e.target.value })} /></Field>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary">Save</button></div></form>}</Modal>
    <Confirm open={pub} title="Publish approved grades" text={`Publish ${toPublish.length} approved grade records and their feedback to students? Students will be notified and can view their results.`} confirmLabel="Publish" onClose={() => setPub(false)} onConfirm={async () => { for (const x of toPublish) await c.update(x.r.id, { published: true }, ""); toast(`${toPublish.length} grades published.`); }} />
  </>;
}
