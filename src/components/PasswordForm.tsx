"use client";
import { useState } from "react";
import { Field, call, useToast } from "./ui";

export function PasswordForm() {
  const toast = useToast(); const [f, setF] = useState({ current: "", password: "", confirm: "" }); const [err, setErr] = useState("");
  return <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setErr(""); if (f.password !== f.confirm) return setErr("New passwords do not match."); try { await call("/api/auth/password", { body: { current: f.current, password: f.password } }); toast("Password changed."); setF({ current: "", password: "", confirm: "" }); } catch (x: any) { setErr(x.message); } }}>
    {err && <p role="alert" className="text-sm text-bad">{err}</p>}
    <Field label="Current password"><input type="password" autoComplete="current-password" className="input" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} /></Field>
    <Field label="New password" hint="At least 8 characters with a letter and a number."><input type="password" autoComplete="new-password" className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
    <Field label="Confirm new password"><input type="password" autoComplete="new-password" className="input" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} /></Field>
    <button className="btn-primary">Change password</button></form>;
}
