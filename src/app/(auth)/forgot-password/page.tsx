"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { call, Field } from "@/components/ui";

export default function Page() {
  const [email, setEmail] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState<any>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Enter a valid email address.");
    setBusy(true); try { setDone(await call("/api/auth/forgot", { body: { email } })); } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  if (done) return <div><MailCheck className="h-10 w-10 text-teal" /><h1 className="mt-4 text-2xl font-extrabold">Check your email</h1><p className="mt-2 text-sm text-muted">{done.message}</p>
    {done.devLink && <p className="mt-4 break-all rounded-xl bg-[#FCF1DC] p-3 text-xs"><strong>Development only:</strong> <a className="underline" href={done.devLink}>{done.devLink}</a></p>}
    <Link href="/login" className="btn-ghost mt-6">Back to log in</Link></div>;
  return <form onSubmit={submit} noValidate className="space-y-5"><div><h1 className="text-3xl font-extrabold">Reset your password</h1><p className="mt-1 text-sm text-muted">Enter your email and we will send you a reset link.</p></div>
    <Field label="Email" error={err}><input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
    <button className="btn-primary w-full py-3" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Send reset link</button>
    <p className="text-center text-sm"><Link href="/login" className="font-semibold text-teal hover:underline">Back to log in</Link></p></form>;
}
