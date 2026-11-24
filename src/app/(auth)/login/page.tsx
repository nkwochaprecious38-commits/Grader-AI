"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { call, Field } from "@/components/ui";

function Form() {
  const q = useSearchParams(); const invite = q.get("invite") || undefined;
  const [f, setF] = useState({ email: "", password: "", remember: false });
  const [err, setErr] = useState(""); const [fe, setFe] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false); const [show, setShow] = useState(false); const [note, setNote] = useState("");
  const needsVerify = /verify your email/i.test(err);
  const notice = q.get("reset") ? "Your password was updated. Log in with the new password." : q.get("verified") ? "Email verified. You can log in now." : q.get("verifyfailed") ? "That verification link is invalid or expired." : q.get("expired") ? "Your session has ended. Please log in again." : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setNote(""); const x: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) x.email = "Enter a valid email address.";
    if (!f.password) x.password = "Enter your password.";
    setFe(x); if (Object.keys(x).length) return;
    setBusy(true);
    try { const r = await call("/api/auth/login", { body: { ...f, invite } }); const n = q.get("next"); window.location.href = n && n.startsWith("/app") && r.redirect !== "/app/student" ? n : r.redirect; }
    catch (e: any) { setErr(e.message); setBusy(false); }
  }
  async function resend() { try { const r = await call("/api/auth/resend", { body: { email: f.email } }); setNote(r.message); } catch (e: any) { setErr(e.message); } }

  return <form onSubmit={submit} noValidate className="space-y-5">
    <div><h1 className="text-3xl font-extrabold">Welcome back</h1><p className="mt-1 text-sm text-muted">Log in to your Grader AI workspace.</p></div>
    {invite && <p className="rounded-xl bg-sky p-3 text-sm">Log in to accept your invitation. New to Grader AI? <Link className="font-semibold text-teal underline" href={`/signup?invite=${invite}`}>Create your account</Link>.</p>}
    {notice && <p role="status" className="flex gap-2 rounded-xl bg-[#E4F5EE] p-3 text-sm text-[#17734F]"><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />{notice}</p>}
    {err && <p role="alert" className="flex gap-2 rounded-xl bg-[#FBE7E7] p-3 text-sm text-[#A33232]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{err}{needsVerify && <> <button type="button" onClick={resend} className="font-semibold underline">Resend verification email</button></>}</span></p>}
    {note && <p role="status" className="rounded-xl bg-sky p-3 text-sm">{note}</p>}
    <Field label="Email" error={fe.email}><input className="input" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@institution.edu" /></Field>
    <Field label="Password" error={fe.password}><div className="relative"><input className="input pr-11" type={show ? "text" : "password"} autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-soft">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></Field>
    <div className="flex items-center justify-between text-sm">
      <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded accent-teal" checked={f.remember} onChange={(e) => setF({ ...f, remember: e.target.checked })} />Remember me</label>
      <Link href="/forgot-password" className="font-semibold text-teal hover:underline">Forgot password?</Link></div>
    <button className="btn-primary w-full py-3" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Logging in" : "Log in"}</button>
    <p className="text-center text-sm text-muted">New to Grader AI? <Link href="/signup" className="font-semibold text-teal hover:underline">Create an account</Link></p>
  </form>;
}
export default function Page() { return <Suspense><Form /></Suspense>; }
