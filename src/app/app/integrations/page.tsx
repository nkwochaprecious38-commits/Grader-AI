"use client";
import { useState } from "react";
import { Plug, CheckCircle2, CircleDashed, AlertTriangle } from "lucide-react";
import { PageHead, Spinner, Modal, Field, useCol, Badge, call, useToast, fdate } from "@/components/ui";

const PLATFORMS = [
  { id: "canvas", name: "Canvas", std: "LTI 1.3 and Canvas REST API", ex: "https://yourschool.instructure.com" },
  { id: "moodle", name: "Moodle", std: "LTI 1.3 and Moodle web services", ex: "https://moodle.yourschool.edu" },
  { id: "blackboard", name: "Blackboard", std: "LTI 1.3 and Blackboard REST API", ex: "https://yourschool.blackboard.com" },
  { id: "brightspace", name: "Brightspace", std: "LTI 1.3 and Brightspace Valence API", ex: "https://yourschool.brightspace.com" },
  { id: "sakai", name: "Sakai", std: "LTI 1.3", ex: "https://sakai.yourschool.edu" },
  { id: "gclassroom", name: "Google Classroom", std: "Google Classroom API with OAuth 2.0", ex: "https://classroom.google.com" },
  { id: "teams", name: "Microsoft Teams for Education", std: "Microsoft Graph Education API with OAuth 2.0", ex: "https://graph.microsoft.com" },
];
const STATUS: Record<string, { l: string; t: string }> = { none: { l: "Not configured", t: "grey" }, saved: { l: "Saved, not tested", t: "amber" }, reachable: { l: "Platform reachable: handshake not verified", t: "blue" }, failed: { l: "Connection test failed", t: "red" } };

export default function Integrations() {
  const c = useCol("integrations"); const toast = useToast(); const [p, setP] = useState<any>(null); const [f, setF] = useState<any>({}); const [busy, setBusy] = useState(false);
  if (c.loading) return <Spinner />;
  const rec = (id: string) => c.rows.find((r: any) => r.platform === id);
  const open = (pl: any) => { setP(pl); setF({ baseUrl: "", clientId: "", deploymentId: "", ...(rec(pl.id) || {}) }); };
  async function save() {
    if (f.baseUrl && !/^https:\/\//.test(f.baseUrl)) return toast("The platform URL must start with https://", "err");
    const body = { platform: p.id, baseUrl: f.baseUrl, clientId: f.clientId, deploymentId: f.deploymentId, status: f.baseUrl ? "saved" : "none" };
    const r = rec(p.id); r ? await c.update(r.id, { ...body, lastTest: undefined }, "Configuration saved. Run a connection test next.") : await c.create(body, "Configuration saved. Run a connection test next."); 
  }
  async function test() { const r = rec(p.id); if (!r) return toast("Save the configuration first.", "err"); setBusy(true); try { const x = await call("/api/integrations/test", { body: { id: r.id } }); toast(x.detail, x.reachable ? "ok" : "err"); c.reload(); } catch (e: any) { toast(e.message, "err"); } finally { setBusy(false); } }
  return <>
    <PageHead title="Integrations" sub="Connect your learning management system. An integration is only marked active once credentials are set and a full connection test succeeds." />
    <div className="mb-5 rounded-xl bg-[#FCF1DC] p-4 text-sm text-[#6F4708]">No integration is active yet. The connection test here confirms the platform address is reachable. Completing the LTI or OAuth handshake requires your platform administrator to register Grader AI and the secret to be set on the server.</div>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{PLATFORMS.map((pl) => { const r = rec(pl.id); const s = STATUS[r?.status || "none"]; return <div key={pl.id} className="card flex flex-col p-5">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-mint text-teal"><Plug className="h-4 w-4" /></span><h2 className="font-bold">{pl.name}</h2></div></div>
      <p className="mt-3 text-xs text-muted">Standard: {pl.std}</p><div className="mt-3"><Badge tone={s.t}>{s.l}</Badge></div>
      {r?.lastTest && <p className="mt-2 text-xs text-muted">Last test {fdate(r.lastTest.at)}: {r.lastTest.detail}</p>}
      <button className="btn-dark mt-4 w-full" onClick={() => open(pl)}>{r ? "Configure" : "Set up"}</button></div>; })}</div>
    <Modal open={!!p} onClose={() => setP(null)} title={`${p?.name} setup`} wide>{p && <div className="space-y-4">
      <ol className="list-decimal space-y-1 rounded-xl bg-soft p-4 pl-8 text-sm"><li>In {p.name}, register Grader AI as an external tool using {p.std}.</li><li>Enter the platform address and the identifiers {p.name} gives you below.</li><li>Set the client secret or private key as a server environment variable. Never enter secrets here.</li><li>Save, then run the connection test.</li></ol>
      <Field label="Platform URL" hint={`Example: ${p.ex}`}><input className="input" value={f.baseUrl} onChange={(e) => setF({ ...f, baseUrl: e.target.value })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Client ID"><input className="input" value={f.clientId} onChange={(e) => setF({ ...f, clientId: e.target.value })} /></Field><Field label="Deployment ID"><input className="input" value={f.deploymentId} onChange={(e) => setF({ ...f, deploymentId: e.target.value })} /></Field></div>
      <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={test} disabled={busy}>{busy ? "Testing" : "Test connection"}</button><button className="btn-primary" onClick={save}>Save configuration</button></div></div>}</Modal>
  </>;
}
