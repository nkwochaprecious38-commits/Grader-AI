"use client";
import { useState } from "react";
import { PageHead, Spinner, Table, Modal, Field, Empty, useCol, Badge, fdate, call, useToast, DemoTag } from "@/components/ui";
import { useSession } from "@/components/Shell";
import { APPROVERS } from "@/lib/roles";

export default function Regrades() {
  const s = useSession(); const c = useCol("regrades"); const asg = useCol("assignments"); const toast = useToast(); const [o, setO] = useState<any>(null); const [f, setF] = useState<any>({ decision: "unchanged", response: "", newScore: "" });
  const can = APPROVERS.includes(s.role);
  if (c.loading) return <Spinner />;
  const rows = [...c.rows].sort((a: any, b: any) => (a.status === b.status ? b.createdAt.localeCompare(a.createdAt) : a.status === "open" ? -1 : 1));
  async function resolve() {
    try { await call("/api/regrade-resolve", { body: { id: o.id, decision: f.decision, response: f.response, newScore: f.decision === "adjusted" ? Number(f.newScore) : undefined } }); toast("Response sent to the student."); setO(null); c.reload(); } catch (e: any) { toast(e.message, "err"); }
  }
  return <>
    <PageHead title="Regrade Requests" sub="Review student concerns, respond, and adjust grades where appropriate. Every change is kept in the history and audit log." />
    {rows.length ? <Table head={["Student", "Assignment", "Item", "Type", "Submitted", "Status", ""]}>{rows.map((r: any) => <tr key={r.id}><td className="td font-medium">{r.studentName}{r.demo && <DemoTag />}</td><td className="td">{r.assignmentTitle}</td><td className="td">{r.questionId || "Whole assessment"}</td><td className="td capitalize">{r.type}</td><td className="td">{fdate(r.createdAt)}</td><td className="td"><Badge tone={r.status === "open" ? "amber" : "green"}>{r.status}</Badge></td>
      <td className="td text-right"><button className="btn-dark btn-sm" onClick={() => { setO(r); setF({ decision: "unchanged", response: "", newScore: "" }); }}>{r.status === "open" && can ? "Review" : "View"}</button></td></tr>)}</Table>
      : <div className="card"><Empty title="No regrade requests" text="Requests from students appear here." /></div>}
    <Modal open={!!o} onClose={() => setO(null)} title="Regrade request" wide>{o && <div className="space-y-4 text-sm">
      <div className="rounded-xl bg-soft p-4"><p className="text-xs font-semibold text-muted">{o.studentName} wrote</p><p className="mt-1 whitespace-pre-wrap">{o.reason}</p></div>
      <div><p className="mb-1 font-bold">History</p>{o.history.map((h: any, i: number) => <p key={i} className="border-t border-line py-1.5 text-xs text-muted">{fdate(h.at)}: {h.by}: {h.action}{h.note ? `. ${h.note}` : ""}</p>)}</div>
      {o.status === "open" && can && <form className="space-y-3 border-t border-line pt-4" onSubmit={(e) => { e.preventDefault(); resolve(); }}>
        <Field label="Decision"><select className="input" value={f.decision} onChange={(e) => setF({ ...f, decision: e.target.value })}><option value="unchanged">Keep the grade unchanged</option><option value="adjusted">Adjust the grade</option><option value="clarified">Provide clarification</option></select></Field>
        {f.decision === "adjusted" && <Field label={`New score for ${o.questionId || "the question"}`} hint={o.questionId ? undefined : "Adjustments need a specific question. Ask the student to resubmit the request for one question, or edit the total in the Gradebook."}><input type="number" step="0.5" className="input" value={f.newScore} onChange={(e) => setF({ ...f, newScore: e.target.value })} /></Field>}
        <Field label="Response to student"><textarea className="input" rows={3} value={f.response} onChange={(e) => setF({ ...f, response: e.target.value })} /></Field>
        <div className="flex justify-end"><button className="btn-primary">Send response</button></div></form>}
      {o.status !== "open" && <p className="rounded-xl bg-mint-pale p-3">Resolved: {o.decision}. {o.response}</p>}</div>}</Modal>
  </>;
}
