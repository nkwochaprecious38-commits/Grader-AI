"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { call, Field } from "@/components/ui";

function Form() {
  const token = useSearchParams().get("token") || "";
  const [f, setF] = useState({ password: "", confirm: "" }); const [fe, setFe] = useState<Record<string, string>>({}); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  if (!token) return <div><h1 className="text-2xl font-extrabold">Invalid reset link</h1><p className="mt-2 text-sm text-muted">Request a new link to continue.</p><Link href="/forgot-password" className="btn-primary mt-5">Request new link</Link></div>;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); const x: Record<string, string> = {};
    if (f.password.length < 8) x.password = "Password must be at least 8 characters."; else if (!/[A-Za-z]/.test(f.password) || !/[0-9]/.test(f.password)) x.password = "Use at least one letter and one number.";
    if (f.confirm !== f.password) x.confirm = "Passwords do not match."; setFe(x); if (Object.keys(x).length) return;
    setBusy(true); try { await call("/api/auth/reset", { body: { token, ...f } }); window.location.href = "/login?reset=1"; } catch (e: any) { setErr(e.message); setBusy(false); }
  }
  return <form onSubmit={submit} noValidate className="space-y-5"><div><h1 className="text-3xl font-extrabold">Choose a new password</h1></div>
    {err && <p role="alert" className="rounded-xl bg-[#FBE7E7] p-3 text-sm text-[#A33232]">{err} <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link></p>}
    <Field label="New password" error={fe.password}><input className="input" type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
    <Field label="Confirm new password" error={fe.confirm}><input className="input" type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} /></Field>
    <button className="btn-primary w-full py-3" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Update password</button></form>;
}
export default function Page() { return <Suspense><Form /></Suspense>; }
