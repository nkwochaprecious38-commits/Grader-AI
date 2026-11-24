"use client";
import { useState } from "react";
import { Plus, Trash2, Copy, History, RefreshCw } from "lucide-react";
import { PageHead, Spinner, Modal, Field, Confirm, Empty, useCol, Badge, DemoTag, fdate, call, useToast } from "@/components/ui";
import { useSession } from "@/components/Shell";
import { APPROVERS } from "@/lib/roles";

const newCrit = () => ({ id: "c" + Math.random().toString(36).slice(2, 7), label: "", desc: "", points: 1, kind: "positive", partial: false, keywords: [] as string[], kw: "" });

export default function Rubrics() {
  const s = useSession(); const c = useCol("rubrics"); const toast = useToast();
  const [m, setM] = useState<any>(null); const [del, setDel] = useState<any>(null); const [hist, setHist] = useState<any>(null); const [apply, setApply] = useState<any>(null);
  const canWrite = ["org_admin", "institution_admin", "instructor", "examiner"].includes(s.role);
  if (c.loading) return <Spinner />;
  const max = (r: any) => r.criteria.filter((x: any) => x.kind !== "negative").reduce((n: number, x: any) => n + Number(x.points), 0);
  async function save() {
    if (!m.name.trim()) return toast("Enter a rubric name.", "err");
    if (!m.criteria.length || m.criteria.some((x: any) => !x.label.trim() || !(Number(x.points) > 0))) return toast("Every criterion needs a label and a positive point value.", "err");
    const criteria = m.criteria.map(({ kw, ...x }: any) => ({ ...x, points: Number(x.points), keywords: (kw !== undefined ? String(kw).split(",").map((k) => k.trim()).filter(Boolean) : x.keywords) }));
    if (m.id) { const before = c.rows.find((r: any) => r.id === m.id); const changed = JSON.stringify(before.criteria) !== JSON.stringify(criteria);
      await c.update(m.id, { name: m.name, criteria, history: changed ? [...(before.history || []), { at: new Date().toISOString(), by: s.user.name, action: "Criteria edited", before: before.criteria.map((x: any) => `${x.label} (${x.points})`).join("; "), after: criteria.map((x: any) => `${x.label} (${x.points})`).join("; ") }] : before.history }, changed ? "Rubric updated. Use Apply to recalculate existing graded work." : "Saved."); }
    else await c.create({ name: m.name, criteria, history: [{ at: new Date().toISOString(), by: s.user.name, action: "Created" }] }, "Rubric created."); setM(null);
  }
  const setC = (i: number, p: any) => setM({ ...m, criteria: m.criteria.map((x: any, j: number) => (j === i ? { ...x, ...p } : x)) });
  return <>
    <PageHead title="Rubrics" sub="Reusable grading criteria with point values, partial credit and a history of changes."><button className={canWrite ? "btn-primary" : "hidden"} onClick={() => setM({ name: "", criteria: [newCrit()] })}><Plus className="h-4 w-4" />Create rubric</button></PageHead>
    {c.rows.length ? <div className="grid gap-5 md:grid-cols-2">{c.rows.map((r: any) => <div key={r.id} className="card p-5">
      <div className="flex items-start justify-between"><h2 className="font-bold">{r.name}{r.demo && <DemoTag />}</h2><Badge tone="teal">{max(r)} marks</Badge></div>
      <ul className="mt-3 space-y-1.5 text-sm">{r.criteria.map((x: any) => <li key={x.id} className="flex justify-between gap-3 border-t border-line pt-1.5 first:border-0"><span>{x.label}{x.desc && <span className="block text-xs text-muted">{x.desc}</span>}</span><span className={x.kind === "negative" ? "font-semibold text-bad" : "font-semibold text-teal-deep"}>{x.kind === "negative" ? "minus " : ""}{x.points}</span></li>)}</ul>
      <div className="mt-4 flex flex-wrap gap-2"><button className="btn-ghost btn-sm" onClick={() => setHist(r)}><History className="h-3.5 w-3.5" />History</button>
        {canWrite && <><button className="btn-ghost btn-sm" onClick={() => setM({ ...r, criteria: r.criteria.map((x: any) => ({ ...x, kw: (x.keywords || []).join(", ") })) })}>Edit</button>
          <button className="btn-ghost btn-sm" onClick={() => c.create({ name: r.name + " (copy)", criteria: r.criteria, history: [{ at: new Date().toISOString(), by: s.user.name, action: "Duplicated" }] }, "Rubric duplicated for reuse.")}><Copy className="h-3.5 w-3.5" />Reuse</button>
          {APPROVERS.includes(s.role) && <button className="btn-ghost btn-sm" onClick={() => setApply(r)}><RefreshCw className="h-3.5 w-3.5" />Apply to graded work</button>}
          <button aria-label="Delete" className="btn-ghost btn-sm" onClick={() => setDel(r)}><Trash2 className="h-3.5 w-3.5" /></button></>}</div></div>)}</div>
      : <div className="card"><Empty title="No rubrics yet" text="Create a rubric, then attach it to assignments or individual questions." /></div>}

    <Modal open={!!m} onClose={() => setM(null)} title={m?.id ? "Edit rubric" : "Create rubric"} wide>{m && <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }}>
      <Field label="Rubric name"><input className="input" value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} /></Field>
      <div className="space-y-3">{m.criteria.map((x: any, i: number) => <div key={x.id} className="rounded-xl border border-line p-3"><div className="grid gap-3 sm:grid-cols-6"><div className="sm:col-span-3"><label className="label text-xs">Criterion</label><input className="input" value={x.label} onChange={(e) => setC(i, { label: e.target.value })} /></div>
        <div><label className="label text-xs">Points</label><input type="number" className="input" min={0.5} step="0.5" value={x.points} onChange={(e) => setC(i, { points: e.target.value })} /></div>
        <div className="sm:col-span-2"><label className="label text-xs">Rule</label><select className="input" value={x.kind} onChange={(e) => setC(i, { kind: e.target.value })}><option value="positive">Positive: awards points</option><option value="negative">Negative: deducts points</option></select></div>
        <div className="sm:col-span-6"><label className="label text-xs">Explanation for graders and students</label><input className="input" value={x.desc} onChange={(e) => setC(i, { desc: e.target.value })} /></div>
        <div className="sm:col-span-4"><label className="label text-xs">Keywords the AI draft should look for (comma separated)</label><input className="input" value={x.kw ?? ""} onChange={(e) => setC(i, { kw: e.target.value })} /></div>
        <label className="flex items-end gap-2 pb-2 text-sm sm:col-span-2"><input type="checkbox" className="accent-teal" checked={!!x.partial} onChange={(e) => setC(i, { partial: e.target.checked })} />Allow partial credit</label></div>
        {m.criteria.length > 1 && <button type="button" className="mt-2 text-xs text-bad" onClick={() => setM({ ...m, criteria: m.criteria.filter((_: any, j: number) => j !== i) })}>Remove criterion</button>}</div>)}</div>
      <div className="flex flex-wrap items-center justify-between gap-2"><button type="button" className="btn-ghost btn-sm" onClick={() => setM({ ...m, criteria: [...m.criteria, newCrit()] })}><Plus className="h-3.5 w-3.5" />Add criterion</button><span className="text-sm text-muted">Maximum marks: {m.criteria.filter((x: any) => x.kind !== "negative").reduce((n: number, x: any) => n + Number(x.points || 0), 0)}</span></div>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setM(null)}>Cancel</button><button className="btn-primary">Save rubric</button></div></form>}</Modal>
    <Modal open={!!hist} onClose={() => setHist(null)} title={`History: ${hist?.name}`}>{hist && <div className="space-y-3 text-sm">{[...(c.rows.find((r: any) => r.id === hist.id)?.history || [])].reverse().map((h: any, i: number) => <div key={i} className="border-t border-line pt-3 first:border-0"><p><strong>{h.action}</strong> by {h.by} on {fdate(h.at)}</p>{h.before && <p className="mt-1 text-xs text-muted">Before: {h.before}</p>}{h.after && <p className="text-xs text-muted">After: {h.after}</p>}{h.affected !== undefined && <p className="text-xs text-muted">Effect: {h.changed} question scores changed across {h.affected} submissions.</p>}</div>)}</div>}</Modal>
    <Confirm open={!!apply} title="Apply rubric to graded work" text="Recalculate question scores for submissions graded with this rubric's criteria, using the current point values. The effect is recorded in the rubric history and the audit log." confirmLabel="Apply" onClose={() => setApply(null)} onConfirm={async () => { try { const r = await call("/api/rubrics/apply", { body: { rubricId: apply.id } }); toast(`${r.changed} scores changed across ${r.affected} submissions.`); c.reload(); } catch (e: any) { toast(e.message, "err"); } }} />
    <Confirm open={!!del} danger title="Delete rubric" text={`Delete ${del?.name}? Assignments using it will no longer show its criteria.`} confirmLabel="Delete" onClose={() => setDel(null)} onConfirm={() => c.remove(del.id)} />
  </>;
}
