"use client";
import { useEffect, useState } from "react";
import { Copy, UserPlus } from "lucide-react";
import { PageHead, Spinner, Table, Modal, Field, useData, call, useToast, Badge, Confirm } from "@/components/ui";
import { useSession } from "@/components/Shell";
import { ROLE_LABEL, type Role } from "@/lib/roles";

export default function Team() {
  const s = useSession(); const { data, loading, reload } = useData<any>("/api/team"); const toast = useToast();
  const [m, setM] = useState<any>(null); const [link, setLink] = useState(""); const [dis, setDis] = useState<any>(null);
  if (loading) return <Spinner />;
  const roles = (Object.keys(ROLE_LABEL) as Role[]).filter((r) => s.role === "org_admin" || r !== "org_admin");
  async function invite(e: React.FormEvent) { e.preventDefault(); try { const r = await call("/api/team", { body: m }); setLink(r.link); toast(r.emailed ? "Invitation emailed." : "Invitation created. Share the link."); setM(null); reload(); } catch (er: any) { toast(er.message, "err"); } }
  async function patch(b: any, ok: string) { try { await call("/api/team", { method: "PATCH", body: b }); toast(ok); reload(); } catch (e: any) { toast(e.message, "err"); } }
  return <>
    <PageHead title="Team Management" sub="Invite colleagues and students, and control what each role can access."><button className="btn-primary" onClick={() => setM({ email: "", role: "instructor" })}><UserPlus className="h-4 w-4" />Invite member</button></PageHead>
    {link && <div className="card mb-4 flex flex-wrap items-center gap-3 p-4 text-sm"><span className="break-all">Invitation link: <strong>{link}</strong></span><button className="btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(link); toast("Link copied."); }}><Copy className="h-3.5 w-3.5" />Copy</button></div>}
    <Table head={["Name", "Email", "Role", "Status", ""]}>{data.members.map((x: any) => <tr key={x.id}><td className="td font-medium">{x.name}</td><td className="td">{x.email}</td>
      <td className="td"><select className="input w-52 py-1.5 text-xs" aria-label={`Role for ${x.name}`} disabled={x.userId === s.user.id || (x.role === "org_admin" && s.role !== "org_admin")} value={x.role} onChange={(e) => patch({ id: x.id, role: e.target.value }, "Role updated.")}>{Object.entries(ROLE_LABEL).filter(([k]) => s.role === "org_admin" || k !== "org_admin" || x.role === "org_admin").map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></td>
      <td className="td"><Badge tone={x.disabled ? "red" : "green"}>{x.disabled ? "Disabled" : "Active"}</Badge></td>
      <td className="td text-right">{x.userId !== s.user.id && <button className="btn-ghost btn-sm" onClick={() => x.disabled ? patch({ id: x.id, disabled: false }, "Access restored.") : setDis(x)}>{x.disabled ? "Restore" : "Disable"}</button>}</td></tr>)}</Table>
    {data.invites.length > 0 && <><h2 className="mb-2 mt-8 font-bold">Pending invitations</h2><div className="card divide-y divide-line">{data.invites.map((i: any) => <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"><span>{i.email} <span className="text-muted">as {ROLE_LABEL[i.role as Role]}</span></span><button className="btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(i.link); toast("Link copied."); }}><Copy className="h-3.5 w-3.5" />Copy link</button></div>)}</div></>}
    <Modal open={!!m} onClose={() => setM(null)} title="Invite a member">{m && <form onSubmit={invite} className="space-y-4"><Field label="Email"><input type="email" required className="input" value={m.email} onChange={(e) => setM({ ...m, email: e.target.value })} /></Field>
      <Field label="Role"><select className="input" value={m.role} onChange={(e) => setM({ ...m, role: e.target.value })}>{roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></Field>
      <p className="text-xs text-muted">The invitation link expires in 7 days and only works for this email address.</p>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setM(null)}>Cancel</button><button className="btn-primary">Create invitation</button></div></form>}</Modal>
    <Confirm open={!!dis} danger title="Disable access" text={`${dis?.name} will no longer be able to open this workspace. Their records are kept.`} confirmLabel="Disable" onClose={() => setDis(null)} onConfirm={() => patch({ id: dis.id, disabled: true }, "Access disabled.")} />
  </>;
}
