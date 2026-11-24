"use client";
import { useRef, useState } from "react";
import { Plus, Upload, Mail, Copy } from "lucide-react";
import { PageHead, Spinner, Table, Modal, Field, Confirm, Empty, useCol, useToast, call, DemoTag, Badge } from "@/components/ui";
import { useSession } from "@/components/Shell";

export default function Students() {
  const s = useSession(); const c = useCol("students"); const courses = useCol("courses"); const toast = useToast();
  const [m, setM] = useState<any>(null); const [del, setDel] = useState<any>(null); const [q, setQ] = useState(""); const [link, setLink] = useState(""); const file = useRef<HTMLInputElement>(null);
  const canWrite = ["org_admin", "institution_admin", "instructor"].includes(s.role);
  if (c.loading) return <Spinner />;
  const rows = c.rows.filter((r: any) => (r.name + r.email).toLowerCase().includes(q.toLowerCase()));
  async function importCsv(f: File) {
    const lines = (await f.text()).split(/\r?\n/).map((l) => l.trim()).filter(Boolean); let n = 0;
    for (const l of lines) { const [name, email, num] = l.split(",").map((x) => x.trim().replace(/^"|"$/g, "")); if (!name || /^name$/i.test(name) || !/^\S+@\S+\.\S+$/.test(email || "")) continue; await call("/api/data/students", { body: { name, email: email.toLowerCase(), studentNumber: num || "", courseIds: [] } }); n++; }
    await c.reload(); toast(n ? `${n} students imported.` : "No valid rows found. Use columns: name, email, student number.", n ? "ok" : "err");
  }
  async function invite(r: any) { try { const x = await call("/api/team", { body: { email: r.email, role: "student", studentId: r.id } }); setLink(x.link); toast(x.emailed ? "Invitation emailed." : "Invitation created. Copy the link below."); } catch (e: any) { toast(e.message, "err"); } }
  return <>
    <PageHead title="Students" sub="Student records. Invite students to give them portal access to their own work and grades.">
      <input className="input w-48" placeholder="Search students" aria-label="Search students" value={q} onChange={(e) => setQ(e.target.value)} />
      {canWrite && <><input ref={file} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} /><button className="btn-ghost" onClick={() => file.current?.click()}><Upload className="h-4 w-4" />Import CSV</button><button className="btn-primary" onClick={() => setM({ name: "", email: "", studentNumber: "", courseIds: [] })}><Plus className="h-4 w-4" />Add student</button></>}</PageHead>
    {link && <div className="card mb-4 flex flex-wrap items-center gap-3 p-4 text-sm"><span className="break-all">Invitation link: <strong>{link}</strong></span><button className="btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(link); toast("Link copied."); }}><Copy className="h-3.5 w-3.5" />Copy</button></div>}
    {rows.length ? <Table head={["Name", "Email", "Number", "Courses", "Portal", ""]}>{rows.map((r: any) => <tr key={r.id}><td className="td font-medium">{r.name}{r.demo && <DemoTag />}</td><td className="td">{r.email}</td><td className="td">{r.studentNumber || "None"}</td>
      <td className="td">{(r.courseIds || []).map((i: string) => courses.rows.find((x: any) => x.id === i)?.code).filter(Boolean).join(", ") || "None"}</td>
      <td className="td">{r.userId ? <Badge tone="green">Active</Badge> : r.demo ? <Badge>Demo only</Badge> : <button className="btn-ghost btn-sm" onClick={() => invite(r)}><Mail className="h-3.5 w-3.5" />Invite</button>}</td>
      <td className="td text-right">{canWrite && <><button className="btn-ghost btn-sm" onClick={() => setM(r)}>Edit</button> <button className="btn-ghost btn-sm" onClick={() => setDel(r)}>Delete</button></>}</td></tr>)}</Table>
      : <div className="card"><Empty title="No students found" text="Add students one at a time or import a CSV with columns: name, email, student number." /></div>}
    <Modal open={!!m} onClose={() => setM(null)} title={m?.id ? "Edit student" : "Add student"}>{m && <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(m.email)) return toast("Enter a valid email.", "err"); m.id ? await c.update(m.id, m) : await c.create({ ...m, email: m.email.toLowerCase() }, "Student added."); setM(null); }}>
      <Field label="Full name"><input className="input" required value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} /></Field>
      <Field label="Email"><input className="input" type="email" required value={m.email} onChange={(e) => setM({ ...m, email: e.target.value })} /></Field>
      <Field label="Student number"><input className="input" value={m.studentNumber || ""} onChange={(e) => setM({ ...m, studentNumber: e.target.value })} /></Field>
      <Field label="Courses"><div className="flex flex-wrap gap-2">{courses.rows.filter((x: any) => !x.archived).map((x: any) => <label key={x.id} className="flex items-center gap-1.5 rounded-lg bg-soft px-2.5 py-1.5 text-sm"><input type="checkbox" className="accent-teal" checked={(m.courseIds || []).includes(x.id)} onChange={(e) => setM({ ...m, courseIds: e.target.checked ? [...(m.courseIds || []), x.id] : m.courseIds.filter((i: string) => i !== x.id) })} />{x.code || x.title}</label>)}{!courses.rows.length && <span className="text-sm text-muted">Create a course first.</span>}</div></Field>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setM(null)}>Cancel</button><button className="btn-primary">Save</button></div></form>}</Modal>
    <Confirm open={!!del} danger title="Delete student" text={`Delete ${del?.name}? Their submissions remain in the workspace records.`} confirmLabel="Delete" onClose={() => setDel(null)} onConfirm={() => c.remove(del.id)} />
  </>;
}
