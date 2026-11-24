"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, MailCheck } from "lucide-react";
import { call, Field } from "@/components/ui";
import { ORG_TYPES, JOB_ROLES } from "@/lib/validators";

const strength = (p: string) => [p.length >= 8, /[A-Za-z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p) || p.length >= 12].filter(Boolean).length;

function Form() {
  const q = useSearchParams(); const invite = q.get("invite") || undefined;
  const [inv, setInv] = useState<{ email: string; role: string; org: string } | null>(null); const [invErr, setInvErr] = useState("");
  const [f, setF] = useState({ fullName: "", email: "", organization: "", orgType: "", role: "", password: "", confirm: "", terms: false });
  const [fe, setFe] = useState<Record<string, string>>({}); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [show, setShow] = useState(false); const [sent, setSent] = useState(false);
  useEffect(() => { if (invite) call("/api/auth/invite?token=" + encodeURIComponent(invite)).then((r) => { setInv(r); setF((x) => ({ ...x, email: r.email, organization: r.org, orgType: "Invited member", role: r.role === "student" ? "Student" : "Team member" })); }).catch((e) => setInvErr(e.message)); }, [invite]);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  function validate() {
    const x: Record<string, string> = {};
    if (f.fullName.trim().length < 2) x.fullName = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) x.email = "Enter a valid work email address.";
    if (f.organization.trim().length < 2) x.organization = "Enter your institution or organization name.";
    if (!f.orgType) x.orgType = "Select an organization type."; if (!f.role) x.role = "Select your role.";
    if (f.password.length < 8) x.password = "Password must be at least 8 characters."; else if (!/[A-Za-z]/.test(f.password) || !/[0-9]/.test(f.password)) x.password = "Use at least one letter and one number.";
    if (f.confirm !== f.password) x.confirm = "Passwords do not match.";
    if (!f.terms) x.terms = "You must accept the terms and conditions.";
    return x;
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); const x = validate(); setFe(x); if (Object.keys(x).length) return;
    setBusy(true);
    try { const r = await call("/api/auth/signup", { body: { ...f, invite } }); if (r.needsVerification) { setSent(true); setBusy(false); } else window.location.href = inv?.role === "student" ? "/app/student" : r.redirect; }
    catch (e: any) { if (e.field) setFe({ [e.field]: e.message }); else setErr(e.message); setBusy(false); }
  }
  if (sent) return <div className="text-center"><MailCheck className="mx-auto h-12 w-12 text-teal" /><h1 className="mt-4 text-2xl font-extrabold">Check your email</h1><p className="mt-2 text-sm text-muted">We sent a verification link to <strong>{f.email}</strong>. Open it to activate your account, then log in.</p><Link href="/login" className="btn-primary mt-6">Go to log in</Link></div>;
  if (invite && invErr) return <div><h1 className="text-2xl font-extrabold">Invitation problem</h1><p className="mt-2 text-sm text-bad">{invErr}</p><p className="mt-4 text-sm text-muted">Ask your administrator to send a new invitation.</p></div>;
  const s = strength(f.password);
  return <form onSubmit={submit} noValidate className="space-y-4">
    <div><h1 className="text-3xl font-extrabold">{inv ? `Join ${inv.org}` : "Create your workspace"}</h1><p className="mt-1 text-sm text-muted">{inv ? "Create your account to accept the invitation." : "Set up Grader AI for your institution or organization."}</p></div>
    {inv && <p className="rounded-xl bg-sky p-3 text-sm">Already have an account? <Link className="font-semibold text-teal underline" href={`/login?invite=${invite}`}>Log in to accept</Link>.</p>}
    {err && <p role="alert" className="flex gap-2 rounded-xl bg-[#FBE7E7] p-3 text-sm text-[#A33232]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{err} {/exists/i.test(err) && <Link href="/login" className="font-semibold underline">Log in</Link>}</p>}
    <Field label="Full name" error={fe.fullName}><input className="input" autoComplete="name" value={f.fullName} onChange={set("fullName")} /></Field>
    <Field label="Work email" error={fe.email}><input className="input" type="email" autoComplete="email" readOnly={!!inv} value={f.email} onChange={set("email")} placeholder="you@institution.edu" /></Field>
    {!inv && <>
      <Field label="Institution or organization name" error={fe.organization}><input className="input" autoComplete="organization" value={f.organization} onChange={set("organization")} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Organization type" error={fe.orgType}><select className="input" value={f.orgType} onChange={set("orgType")}><option value="">Select</option>{ORG_TYPES.map((o) => <option key={o}>{o}</option>)}</select></Field>
        <Field label="Your role" error={fe.role} hint="You will be the workspace administrator."><select className="input" value={f.role} onChange={set("role")}><option value="">Select</option>{JOB_ROLES.map((o) => <option key={o}>{o}</option>)}</select></Field></div></>}
    <Field label="Password" error={fe.password}><div className="relative"><input className="input pr-11" type={show ? "text" : "password"} autoComplete="new-password" value={f.password} onChange={set("password")} />
      <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-soft">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
      {f.password && <div className="mt-2 flex items-center gap-2"><div className="flex flex-1 gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= s ? (s < 3 ? "bg-warn" : "bg-ok") : "bg-line"}`} />)}</div><span className="text-xs text-muted">{s < 3 ? "Weak" : s < 4 ? "Good" : "Strong"}</span></div>}</Field>
    <Field label="Confirm password" error={fe.confirm}><input className="input" type={show ? "text" : "password"} autoComplete="new-password" value={f.confirm} onChange={set("confirm")} /></Field>
    <div><label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-teal" checked={f.terms} onChange={set("terms")} /><span>I accept the <Link href="/terms" target="_blank" className="font-semibold text-teal underline">terms and conditions</Link>.</span></label>{fe.terms && <p role="alert" className="mt-1 text-xs font-medium text-bad">{fe.terms}</p>}</div>
    <button className="btn-primary w-full py-3" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Creating account" : inv ? "Join workspace" : "Create workspace"}</button>
    <p className="text-center text-sm text-muted">Already have an account? <Link href="/login" className="font-semibold text-teal hover:underline">Log in</Link></p>
  </form>;
}
export default function Page() { return <Suspense><Form /></Suspense>; }
