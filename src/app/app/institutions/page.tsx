"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHead, Spinner, Table, Modal, Field, Confirm, Empty, useCol } from "@/components/ui";
import { useSession } from "@/components/Shell";

export default function Institutions() {
  const s = useSession(); const c = useCol("institutions"); const [m, setM] = useState<any>(null); const [del, setDel] = useState<any>(null);
  if (c.loading) return <Spinner />;
  return <>
    <PageHead title="Institutions" sub="Schools, faculties or departments within your organization."><button className="btn-primary" onClick={() => setM({ name: "", kind: "Department" })}><Plus className="h-4 w-4" />Add institution</button></PageHead>
    <div className="card mb-6 p-5"><p className="text-xs text-muted">Organization</p><p className="font-head text-lg font-bold">{s.org.name}</p><p className="text-sm text-muted">{s.org.type}</p></div>
    {c.rows.length ? <Table head={["Name", "Type", "Contact", ""]}>{c.rows.map((r: any) => <tr key={r.id}><td className="td font-medium">{r.name}</td><td className="td">{r.kind}</td><td className="td">{r.contact || "None"}</td><td className="td text-right"><button className="btn-ghost btn-sm" onClick={() => setM(r)}>Edit</button> <button aria-label="Delete" className="btn-ghost btn-sm" onClick={() => setDel(r)}><Trash2 className="h-3.5 w-3.5" /></button></td></tr>)}</Table> : <div className="card"><Empty title="No institutions yet" text="Add schools, faculties or departments to organize courses." /></div>}
    <Modal open={!!m} onClose={() => setM(null)} title={m?.id ? "Edit institution" : "Add institution"}>{m && <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); if (!m.name.trim()) return; m.id ? await c.update(m.id, m) : await c.create(m); setM(null); }}>
      <Field label="Name"><input className="input" value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} required /></Field>
      <Field label="Type"><select className="input" value={m.kind} onChange={(e) => setM({ ...m, kind: e.target.value })}>{["School", "Faculty", "Department", "Campus", "Other"].map((k) => <option key={k}>{k}</option>)}</select></Field>
      <Field label="Contact email"><input type="email" className="input" value={m.contact || ""} onChange={(e) => setM({ ...m, contact: e.target.value })} /></Field>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setM(null)}>Cancel</button><button className="btn-primary">Save</button></div></form>}</Modal>
    <Confirm open={!!del} danger title="Delete institution" text={`Delete ${del?.name}? Courses are not removed.`} confirmLabel="Delete" onClose={() => setDel(null)} onConfirm={() => c.remove(del.id)} />
  </>;
}
