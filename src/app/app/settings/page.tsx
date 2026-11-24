"use client";
import { useState } from "react";
import { PageHead, Field, call, useToast, Confirm, useData, Table, fdate } from "@/components/ui";
import { PasswordForm } from "@/components/PasswordForm";
import { useSession } from "@/components/Shell";
import { ROLE_LABEL } from "@/lib/roles";

export default function Settings() {
  const s = useSession(); const toast = useToast(); const [name, setName] = useState(s.org.name); const [rm, setRm] = useState(false);
  const audit = useData<any[]>(["org_admin", "institution_admin"].includes(s.role) ? "/api/data/audit" : null);
  return <>
    <PageHead title="Settings" />
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-5"><h2 className="mb-3 font-bold">Profile</h2><dl className="space-y-2 text-sm"><div className="flex justify-between"><dt className="text-muted">Name</dt><dd>{s.user.name}</dd></div><div className="flex justify-between"><dt className="text-muted">Email</dt><dd>{s.user.email}</dd></div><div className="flex justify-between"><dt className="text-muted">Role</dt><dd>{ROLE_LABEL[s.role]}</dd></div></dl></div>
      <div className="card p-5"><h2 className="mb-3 font-bold">Password</h2><PasswordForm /></div>
      {s.role === "org_admin" && <div className="card p-5"><h2 className="mb-3 font-bold">Organization</h2><Field label="Organization name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field><button className="btn-primary mt-3" onClick={async () => { try { await call("/api/workspace", { method: "PATCH", body: { name } }); toast("Saved. Reload to see the new name."); } catch (e: any) { toast(e.message, "err"); } }}>Save</button></div>}
      {["org_admin", "institution_admin"].includes(s.role) && <div className="card p-5"><h2 className="mb-2 font-bold">Demonstration data</h2><p className="text-sm text-muted">New workspaces include sample courses, students and submissions labelled Demo. Remove them when you are ready to use real records. Only demonstration records are removed.</p><button className="btn-danger mt-3" onClick={() => setRm(true)}>Remove demonstration data</button></div>}
    </div>
    {audit.data && <><h2 className="mb-3 mt-8 font-bold">Audit log</h2><Table head={["When", "Who", "Action"]}>{audit.data.slice(0, 40).map((a: any) => <tr key={a.id}><td className="td whitespace-nowrap">{fdate(a.createdAt)}</td><td className="td">{a.actorName}</td><td className="td">{a.action.replace(/[._]/g, " ")}{a.action === "grade.changed" && a.detail?.to ? `: ${a.detail.from?.score ?? "none"} to ${a.detail.to.score ?? "none"}${a.detail.to.published ? ", published" : a.detail.to.approved ? ", approved" : ""}${a.detail.aiOverrides?.length ? `, overrode AI on ${a.detail.aiOverrides.join(" ")}` : ""}` : ""}</td></tr>)}</Table></>}
    <Confirm open={rm} danger title="Remove demonstration data" text="Delete all records labelled Demo, including sample courses, students, assignments and submissions? Your own records are not affected." confirmLabel="Remove" onClose={() => setRm(false)} onConfirm={async () => { try { const r = await call("/api/workspace", { method: "DELETE" }); toast(`${r.removed} demonstration records removed.`); setTimeout(() => location.reload(), 800); } catch (e: any) { toast(e.message, "err"); } }} />
  </>;
}
