"use client";
import { useState } from "react";
import { Sparkles, Flag, CheckCircle2, Layers } from "lucide-react";
import { PageHead, Spinner, Modal, Empty, useCol, Badge, call, useToast, DemoTag, cx, Confirm } from "@/components/ui";
import { useSession } from "@/components/Shell";
import { subStatus } from "@/lib/status";
import { APPROVERS } from "@/lib/roles";

export default function AIGrading() {
  const s = useSession(); const subs = useCol("submissions"); const asg = useCol("assignments"); const st = useCol("students"); const rub = useCol("rubrics"); const toast = useToast();
  const [aid, setAid] = useState(""); const [tab, setTab] = useState<"queue" | "groups">("queue"); const [sel, setSel] = useState<string[]>([]); const [open, setOpen] = useState<any>(null); const [busy, setBusy] = useState(false);
  if (subs.loading || asg.loading) return <Spinner />;
  const a = asg.rows.find((x: any) => x.id === aid); const list = subs.rows.filter((x: any) => x.assignmentId === aid);
  const name = (id: string) => st.rows.find((x: any) => x.id === id)?.name || "Unknown student";
  const todo = list.filter((x: any) => !x.approved);
  async function generate(ids: string[]) {
    if (!ids.length) return toast("Select ungraded submissions first.", "err"); setBusy(true);
    try { const r = await call("/api/ai/suggest", { body: { submissionIds: ids } }); toast(`Draft suggestions created for ${r.count} submissions (${r.engine === "model" ? "model" : "rule based"} engine). Nothing has been graded or published.`); setSel([]); subs.reload(); } catch (e: any) { toast(e.message, "err"); } finally { setBusy(false); }
  }
  return <>
    <PageHead title="AI Grading" sub="AI drafts marks and explanations. You review, edit, approve or reject every suggestion. Nothing is published without approval.">
      <select className="input w-64" aria-label="Assignment" value={aid} onChange={(e) => { setAid(e.target.value); setSel([]); }}><option value="">Choose an assignment</option>{asg.rows.map((x: any) => <option key={x.id} value={x.id}>{x.title}</option>)}</select></PageHead>
    <div className="mb-4 rounded-xl bg-sky p-3 text-xs text-[#245B7A]">Suggestions use a transparent rule based draft engine unless a model key is configured on the server. Rule based drafts check for expected terms only and flag low confidence answers for your review.</div>
    {!a ? <div className="card"><Empty title="Choose an assignment" text="Select an assignment to see its submissions and AI suggestions." /></div> : <>
      <div className="mb-4 flex gap-1 border-b border-line">{[["queue", "Review queue"], ["groups", "Answer groups"]].map(([k, l]) => <button key={k} onClick={() => setTab(k as any)} className={cx("-mb-px border-b-2 px-4 py-2 text-sm font-semibold", tab === k ? "border-teal text-teal-deep" : "border-transparent text-muted")}>{l}</button>)}</div>
      {tab === "queue" ? <>
        <div className="mb-3 flex flex-wrap items-center gap-2"><button className="btn-primary" disabled={busy} onClick={() => generate(sel.length ? sel : todo.map((x: any) => x.id))}><Sparkles className="h-4 w-4" />{busy ? "Generating" : sel.length ? `Suggest for ${sel.length} selected` : "Suggest marks for all ungraded"}</button><span className="text-sm text-muted">{todo.length} awaiting approval of {list.length}</span></div>
        {list.length ? <div className="card divide-y divide-line">{list.map((x: any) => { const b = subStatus(x); const flags = Object.values<any>(x.suggestions || {}).filter((v) => v.flag).length; return <div key={x.id} className="flex flex-wrap items-center gap-3 p-4">
          <input type="checkbox" aria-label={`Select ${name(x.studentId)}`} disabled={x.approved} className="h-4 w-4 accent-teal" checked={sel.includes(x.id)} onChange={(e) => setSel(e.target.checked ? [...sel, x.id] : sel.filter((i) => i !== x.id))} />
          <div className="min-w-0 flex-1"><p className="font-medium">{name(x.studentId)}{x.demo && <DemoTag />}</p><p className="text-xs text-muted">{x.score != null ? `Marks ${x.override ?? x.score} of ${a.total}` : "Not scored"}</p></div>
          {flags > 0 && !x.approved && <Badge tone="amber">{flags} flagged</Badge>}<Badge tone={b.tone}>{b.label}</Badge>
          <button className="btn-dark btn-sm" onClick={() => setOpen(x)}>{x.approved ? "View" : "Review"}</button></div>; })}</div> : <div className="card"><Empty title="No submissions for this assignment" /></div>}</> :
        <Groups a={a} subs={list} onApplied={() => subs.reload()} name={name} />}
    </>}
    {open && <Panel key={open.id} sub={subs.rows.find((x: any) => x.id === open.id) || open} a={a} rubrics={rub.rows} student={name(open.studentId)} c={subs} role={s.role} onClose={() => setOpen(null)} />}
  </>;
}

function Panel({ sub, a, rubrics, student, c, role, onClose }: any) {
  const toast = useToast();
  const [g, setG] = useState<Record<string, any>>(() => JSON.parse(JSON.stringify(sub.grades || {}))); const [confirm, setConfirm] = useState(false);
  const canApprove = APPROVERS.includes(role); const locked = sub.approved;
  const total = Object.values(g).reduce((n: number, x: any) => n + (Number(x.score) || 0), 0);
  const allGraded = a.questions.every((q: any) => g[q.id] && Number.isFinite(Number(g[q.id].score)));
  const rubricFor = (q: any) => rubrics.find((r: any) => r.id === (q.rubricId || a.rubricId));
  const set = (qid: string, p: any) => setG((x) => ({ ...x, [qid]: { ...(x[qid] || {}), ...p } }));
  const setCrit = (q: any, r: any, cid: string, v: number) => { const cur = { ...(g[q.id]?.criteria || {}), [cid]: v }; const sc = r.criteria.reduce((n: number, c: any) => n + (c.kind === "negative" ? -Math.abs(Number(cur[c.id]) || 0) : Number(cur[c.id]) || 0), 0); set(q.id, { criteria: cur, score: Math.max(0, Math.min(q.points, sc)) }); };
  const save = async (extra: any = {}, ok = "Marks saved.") => { await c.update(sub.id, { grades: g, ...extra }, ok); };
  return <Modal open onClose={onClose} title={`${student}: ${a.title}`} wide><div className="space-y-5">
    {locked && <p className="rounded-xl bg-mint-pale p-3 text-sm">Approved by {sub.approvedBy}. {sub.published ? "Published to the student." : "Not yet published."}</p>}
    {sub.manualReview && <p className="rounded-xl bg-[#FBE7E7] p-3 text-sm text-[#A33232]">Flagged for manual review: {sub.manualReason}</p>}
    {a.questions.map((q: any) => { const sg = sub.suggestions?.[q.id]; const r = rubricFor(q); const gr = g[q.id];
      return <div key={q.id} className="rounded-xl border border-line p-4">
        <div className="flex flex-wrap items-start justify-between gap-2"><p className="font-semibold"><span className="mr-2 text-teal">{q.id}</span>{q.prompt}</p><Badge>{q.points} marks</Badge></div>
        <div className="mt-3 rounded-lg bg-soft p-3 text-sm"><p className="mb-1 text-xs font-semibold text-muted">Student answer</p><p className="whitespace-pre-wrap">{sub.answers?.[q.id] || <span className="text-muted">No typed answer.{sub.files?.length ? " Review the uploaded file in Submissions." : ""}</span>}</p></div>
        {q.key && <p className="mt-2 text-xs text-muted">Answer key: {q.key}</p>}
        {sg && !sg.rejected && <div className={cx("mt-3 rounded-lg border p-3 text-sm", sg.flag ? "border-warn/50 bg-[#FCF1DC]/50" : "border-wint/40 bg-mint-pale")}>
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">AI suggestion ({sg.source === "model" ? "model" : "rule based draft"}): {sg.score} of {sg.max}</p><span className="text-xs text-muted">Confidence {Math.round(sg.confidence * 100)}%</span></div>
          <p className="mt-1 text-muted">{sg.explanation}</p>
          {sg.rubricMap?.length > 0 && <ul className="mt-2 space-y-0.5 text-xs">{sg.rubricMap.map((m: any) => <li key={m.criterionId}><strong>{m.label}</strong>: {m.awarded} of {m.max}. {m.reason}</li>)}</ul>}
          {sg.flag && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#8A5A0B]"><Flag className="h-3.5 w-3.5" />{sg.flagReason}</p>}
          {!locked && <div className="mt-3 flex gap-2"><button className="btn-primary btn-sm" onClick={() => setG((x) => ({ ...x, [q.id]: { ...(x[q.id] || {}), score: sg.score, comment: x[q.id]?.comment || "", criteria: sg.rubricMap?.length ? Object.fromEntries(sg.rubricMap.map((m: any) => [m.criterionId, Math.abs(m.awarded)])) : x[q.id]?.criteria } }))}>Use suggestion</button>
            <button className="btn-ghost btn-sm" onClick={() => c.update(sub.id, { suggestions: { ...sub.suggestions, [q.id]: { ...sg, rejected: true } } }, "Suggestion rejected. Enter your own marks.")}>Reject</button></div>}</div>}
        {sg?.rejected && <p className="mt-2 text-xs text-muted">AI suggestion rejected by instructor.</p>}
        {r && q.type !== "mcq" && <div className="mt-3"><p className="mb-1 text-xs font-semibold text-muted">Rubric: {r.name}</p><div className="grid gap-2 sm:grid-cols-2">{r.criteria.map((cr: any) => <label key={cr.id} className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-xs"><span>{cr.label} <span className="text-muted">({cr.kind === "negative" ? "deduct up to " : "max "}{Math.abs(cr.points)})</span></span>
          <input type="number" disabled={locked} min={0} max={Math.abs(cr.points)} step="0.5" className="input w-16 py-1" value={gr?.criteria?.[cr.id] ?? ""} onChange={(e) => setCrit(q, r, cr.id, Math.min(Math.abs(cr.points), Math.max(0, Number(e.target.value))))} /></label>)}</div></div>}
        <div className="mt-3 grid gap-3 sm:grid-cols-4"><div><label className="label text-xs">Score (max {q.points})</label><input type="number" disabled={locked} min={0} max={q.points} step="0.5" className="input" value={gr?.score ?? ""} onChange={(e) => set(q.id, { score: e.target.value === "" ? undefined : Math.min(q.points, Math.max(0, Number(e.target.value))) })} /></div>
          <div className="sm:col-span-3"><label className="label text-xs">Comment for student</label><input disabled={locked} className="input" value={gr?.comment || ""} onChange={(e) => set(q.id, { comment: e.target.value })} /></div></div></div>; })}
    <div className="rounded-xl bg-soft p-4 text-sm"><p className="font-semibold">How the total is calculated</p><p className="mt-1 text-muted">{a.questions.map((q: any) => `${q.id}: ${g[q.id]?.score ?? "not scored"}`).join("  +  ")}  =  <strong className="text-ink">{total} of {a.total}</strong> ({a.total ? Math.round((total / a.total) * 100) : 0}%)</p></div>
    {!locked && <div className="flex flex-wrap justify-end gap-2">
      <button className="btn-ghost" onClick={() => c.update(sub.id, { manualReview: true, manualReason: "Sent for manual review by grader.", grades: g }, "Sent for manual review.")}><Flag className="h-4 w-4" />Send to manual review</button>
      <button className="btn-ghost" onClick={() => save({ manualReview: false, status: "graded" })}>Save marks</button>
      {canApprove ? <button className="btn-primary" disabled={!allGraded} title={allGraded ? "" : "Score every question first"} onClick={() => setConfirm(true)}><CheckCircle2 className="h-4 w-4" />Approve grades</button> : <span className="self-center text-xs text-muted">An instructor must approve these marks.</span>}</div>}
    <Confirm open={confirm} title="Approve grades" text={`Approve ${total} of ${a.total} for ${student}? Approved grades are recorded in the audit log. They are not visible to the student until you publish them.`} confirmLabel="Approve" onClose={() => setConfirm(false)} onConfirm={async () => { await save({ approved: true, manualReview: false, status: "graded" }, "Grades approved. Publish them from the Gradebook."); onClose(); }} />
  </div></Modal>;
}

function Groups({ a, subs, onApplied, name }: any) {
  const toast = useToast(); const [q, setQ] = useState(a.questions[0]?.id || ""); const [th, setTh] = useState(0.5); const [res, setRes] = useState<any>(null); const [busy, setBusy] = useState(false);
  const [score, setScore] = useState<Record<string, string>>({}); const [skip, setSkip] = useState<Record<string, string[]>>({}); const [fb, setFb] = useState<Record<string, string>>({});
  const question = a.questions.find((x: any) => x.id === q);
  async function run() { setBusy(true); try { setRes(await call("/api/ai/group", { body: { assignmentId: a.id, questionId: q, threshold: th } })); } catch (e: any) { toast(e.message, "err"); } finally { setBusy(false); } }
  async function apply(gp: any) {
    const sc = Number(score[gp.key]); if (!Number.isFinite(sc) || sc < 0 || sc > question.points) return toast(`Enter a score between 0 and ${question.points}.`, "err");
    const ids = gp.ids.filter((i: string) => !(skip[gp.key] || []).includes(i)); let n = 0;
    for (const id of ids) { const sub = subs.find((x: any) => x.id === id); if (!sub || sub.approved) continue; await call(`/api/data/submissions/${id}`, { method: "PATCH", body: { grades: { ...(sub.grades || {}), [q]: { ...(sub.grades?.[q] || {}), score: sc, comment: fb[gp.key] || sub.grades?.[q]?.comment || "" } }, status: "graded" } }); n++; }
    toast(`Marks applied to ${n} submissions. They still need individual approval.`); onApplied(); run();
  }
  return <div className="space-y-4">
    <div className="card flex flex-wrap items-end gap-3 p-4"><div><label className="label text-xs">Question</label><select className="input" value={q} onChange={(e) => { setQ(e.target.value); setRes(null); }}>{a.questions.map((x: any) => <option key={x.id} value={x.id}>{x.id}: {x.prompt.slice(0, 40)}</option>)}</select></div>
      <div><label className="label text-xs">Similarity threshold: {Math.round(th * 100)}%</label><input type="range" min={0.3} max={0.9} step={0.05} value={th} onChange={(e) => setTh(Number(e.target.value))} className="accent-teal" /></div>
      <button className="btn-primary" disabled={busy} onClick={run}><Layers className="h-4 w-4" />Find similar answers</button></div>
    <p className="text-xs text-muted">Groups are suggestions based on similar wording. Similar wording is not evidence of plagiarism or misconduct. Review each group before applying marks.</p>
    {res && (res.groups.length ? res.groups.map((gp: any, i: number) => { const marks = gp.members.map((m: any) => subs.find((x: any) => x.id === m.id)?.grades?.[q]?.score).filter((v: any) => typeof v === "number");
      return <div key={gp.key} className="card p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">Group {i + 1}: {gp.ids.length} answers</h3><span className="text-xs text-muted">Similarity {Math.round(gp.avgSimilarity * 100)}%{marks.length ? ` · marked ${marks.length}, average ${(marks.reduce((x: number, y: number) => x + y, 0) / marks.length).toFixed(1)}` : ""}</span></div>
        {gp.commonTerms.length > 0 && <p className="mt-1 text-xs text-muted">Shared terms: {gp.commonTerms.join(", ")}</p>}
        <div className="mt-3 space-y-1.5">{gp.members.map((m: any) => <label key={m.id} className="flex gap-2 rounded-lg bg-soft p-2 text-sm"><input type="checkbox" className="mt-1 accent-teal" checked={!(skip[gp.key] || []).includes(m.id)} onChange={(e) => setSkip({ ...skip, [gp.key]: e.target.checked ? (skip[gp.key] || []).filter((x) => x !== m.id) : [...(skip[gp.key] || []), m.id] })} /><span><strong>{m.student}</strong>: {m.text}</span></label>)}</div>
        <p className="mt-2 text-xs text-muted">Untick a student to treat their answer as an individual exception.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4"><div><label className="label text-xs">Score for group (max {question.points})</label><input type="number" className="input" min={0} max={question.points} step="0.5" value={score[gp.key] || ""} onChange={(e) => setScore({ ...score, [gp.key]: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label text-xs">Common feedback</label><input className="input" value={fb[gp.key] ?? ""} onChange={(e) => setFb({ ...fb, [gp.key]: e.target.value })} placeholder={gp.commonTerms.length ? `Suggested: Good use of ${gp.commonTerms.slice(0, 3).join(", ")}. Add detail on what is missing.` : "Feedback for this group"} />{!fb[gp.key] && gp.commonTerms.length > 0 && <button className="mt-1 text-xs font-semibold text-teal underline" onClick={() => setFb({ ...fb, [gp.key]: `Good use of ${gp.commonTerms.slice(0, 3).join(", ")}. Add detail on what is missing.` })}>Use suggested feedback</button>}</div>
          <div className="flex items-end"><button className="btn-dark w-full" onClick={() => apply(gp)}>Apply to group</button></div></div></div>; }) : <div className="card"><Empty title="No similar groups found" text="Try lowering the threshold, or make sure answers have been submitted as text." /></div>)}
  </div>;
}
