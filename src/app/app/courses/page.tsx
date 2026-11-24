"use client";
import { useState } from "react";
import { Plus, Archive, Users as UsersIcon } from "lucide-react";
import { PageHead, Spinner, Modal, Field, Confirm, Empty, useCol, Badge, DemoTag, fdate } from "@/components/ui";
import { useSession } from "@/components/Shell";

export default function Courses() {
  const s = useSession(); const c = useCol("courses"); const st = useCol("students"); const asg = useCol("assignments");
  const [m, setM] = useState<any>(null); const [detail, setDetail] = useState<any>(null); const [arch, setArch] = useState<any>(null); const [show, setShow] = useState(false);
  const canWrite = ["org_admin", "institution_admin", "instructor"].includes(s.role);
  if (c.loading || st.loading) return <Spinner />;
  const rows = c.rows.filter((r: any) => show || !r.archived);
  return <>
    <PageHead title="Courses" sub="Create courses, enroll students and organize groups.">
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-teal" checked={show} onChange={(e) => setShow(e.target.checked)} />Show archived</label>
      {canWrite && <button className="btn-primary" onClick={() => setM({ title: "", code: "", term: "", description: "", groups: [] })}><Plus className="h-4 w-4" />Create course</button>}</PageHead>
    {rows.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{rows.map((r: any) => {
      const n = st.rows.filter((x: any) => (x.courseIds || []).includes(r.id)).length; const a = asg.rows.filter((x: any) => x.courseId === r.id).length;
      return <div key={r.id} className="card flex flex-col p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-teal">{r.code}</p><h2 className="font-bold">{r.title}{r.demo && <DemoTag />}</h2></div>{r.archived && <Badge>Archived</Badge>}</div>
        <p className="mt-1 text-sm text-muted">{r.term}</p><p className="mt-3 flex-1 text-sm text-muted">{r.description}</p>
        <div className="mt-4 flex gap-4 text-sm"><span className="flex items-center gap-1"><UsersIcon className="h-4 w-4 text-teal" />{n} students</span><span>{a} assignments</span></div>
        <div className="mt-4 flex gap-2"><button className="btn-dark btn-sm" onClick={() => setDetail(r)}>Open</button>{canWrite && <><button className="btn-ghost btn-sm" onClick={() => setM(r)}>Edit</button><button className="btn-ghost btn-sm" onClick={() => r.archived ? c.update(r.id, { archived: false }, "Course restored.") : setArch(r)}><Archive className="h-3.5 w-3.5" />{r.archived ? "Restore" : "Archive"}</button></>}</div></div>; })}</div>
      : <div className="card"><Empty title="No courses yet" text="Create your first course to start adding students and assignments." action={canWrite ? <button className="btn-primary" onClick={() => setM({ title: "", code: "", term: "", description: "", groups: [] })}>Create course</button> : undefined} /></div>}

    <Modal open={!!m} onClose={() => setM(null)} title={m?.id ? "Edit course" : "Create course"}>{m && <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); if (!m.title.trim()) return; m.id ? await c.update(m.id, m) : await c.create(m, "Course created."); setM(null); }}>
      <Field label="Course title"><input className="input" required value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Course code"><input className="input" value={m.code} onChange={(e) => setM({ ...m, code: e.target.value })} /></Field><Field label="Term"><input className="input" value={m.term} onChange={(e) => setM({ ...m, term: e.target.value })} placeholder="Autumn 2026" /></Field></div>
      <Field label="Description"><textarea className="input" rows={3} value={m.description} onChange={(e) => setM({ ...m, description: e.target.value })} /></Field>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setM(null)}>Cancel</button><button className="btn-primary">Save</button></div></form>}</Modal>
    {detail && <CourseDetail course={c.rows.find((x: any) => x.id === detail.id)} onClose={() => setDetail(null)} c={c} st={st} asg={asg} canWrite={canWrite} />}
    <Confirm open={!!arch} title="Archive course" text={`Archive ${arch?.title}? It will be hidden from lists but its records are kept, and you can restore it.`} confirmLabel="Archive" onClose={() => setArch(null)} onConfirm={() => c.update(arch.id, { archived: true }, "Course archived.")} />
  </>;
}

function CourseDetail({ course, onClose, c, st, asg, canWrite }: any) {
  const [grp, setGrp] = useState(""); const [sel, setSel] = useState("");
  const students = st.rows.filter((x: any) => (x.courseIds || []).includes(course.id)); const others = st.rows.filter((x: any) => !(x.courseIds || []).includes(course.id));
  const groups: { name: string; studentIds: string[] }[] = course.groups || [];
  return <Modal open onClose={onClose} title={course.title} wide><div className="space-y-6 text-sm">
    <div className="flex flex-wrap gap-2"><Badge tone="teal">{course.code}</Badge><Badge>{course.term}</Badge></div>
    <section><h3 className="mb-2 font-bold">Students ({students.length})</h3>
      {students.map((x: any) => <div key={x.id} className="flex items-center justify-between border-t border-line py-2"><span>{x.name} <span className="text-muted">{x.email}</span></span>{canWrite && <button className="btn-ghost btn-sm" onClick={() => st.update(x.id, { courseIds: x.courseIds.filter((i: string) => i !== course.id) }, "Student removed from course.")}>Remove</button>}</div>)}
      {!students.length && <p className="text-muted">No students enrolled.</p>}
      {canWrite && others.length > 0 && <div className="mt-3 flex gap-2"><select className="input" value={sel} onChange={(e) => setSel(e.target.value)}><option value="">Add a student</option>{others.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}</select><button className="btn-primary" disabled={!sel} onClick={async () => { const x = st.rows.find((r: any) => r.id === sel); await st.update(sel, { courseIds: [...(x.courseIds || []), course.id] }, "Student enrolled."); setSel(""); }}>Add</button></div>}</section>
    <section><h3 className="mb-2 font-bold">Course groups</h3>
      {groups.map((g, i) => <div key={i} className="mb-2 rounded-xl border border-line p-3"><div className="flex items-center justify-between"><strong>{g.name}</strong>{canWrite && <button className="btn-ghost btn-sm" onClick={() => c.update(course.id, { groups: groups.filter((_, j) => j !== i) }, "Group removed.")}>Delete group</button>}</div>
        <div className="mt-2 flex flex-wrap gap-2">{students.map((x: any) => <label key={x.id} className="flex items-center gap-1.5 rounded-lg bg-soft px-2 py-1 text-xs"><input type="checkbox" className="accent-teal" disabled={!canWrite} checked={g.studentIds.includes(x.id)} onChange={(e) => c.update(course.id, { groups: groups.map((y, j) => j === i ? { ...y, studentIds: e.target.checked ? [...y.studentIds, x.id] : y.studentIds.filter((z) => z !== x.id) } : y) }, "Group updated.")} />{x.name}</label>)}</div></div>)}
      {canWrite && <div className="mt-2 flex gap-2"><input className="input" placeholder="New group name" value={grp} onChange={(e) => setGrp(e.target.value)} /><button className="btn-ghost" disabled={!grp.trim()} onClick={async () => { await c.update(course.id, { groups: [...groups, { name: grp.trim(), studentIds: [] }] }, "Group created."); setGrp(""); }}>Create group</button></div>}</section>
    <section><h3 className="mb-2 font-bold">Course activity</h3>{asg.rows.filter((x: any) => x.courseId === course.id).map((a: any) => <div key={a.id} className="flex justify-between border-t border-line py-2"><span>{a.title}</span><span className="text-muted">{a.status} · due {fdate(a.due)}</span></div>)}{!asg.rows.some((x: any) => x.courseId === course.id) && <p className="text-muted">No assignments yet.</p>}</section>
  </div></Modal>;
}
