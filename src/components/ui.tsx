"use client";
import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import * as Icons from "lucide-react";
import { X, Loader2, CheckCircle2, AlertCircle, Inbox } from "lucide-react";

export const Icon = ({ name, ...p }: { name: string } & Icons.LucideProps) => { const C = (Icons as any)[name] || Icons.Circle; return <C {...p} />; };
export const cx = (...a: any[]) => a.filter(Boolean).join(" ");

export function Spinner({ label = "Loading" }: { label?: string }) { return <div role="status" className="flex items-center gap-2 p-6 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" />{label}</div>; }
export function Empty({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return <div className="flex flex-col items-center gap-2 px-6 py-12 text-center"><div className="rounded-full bg-mint-pale p-3 text-teal"><Inbox className="h-6 w-6" /></div><p className="font-head font-semibold text-ink">{title}</p>{text && <p className="max-w-sm text-sm text-muted">{text}</p>}{action}</div>;
}
const TONES: Record<string, string> = { green: "bg-[#E4F5EE] text-[#17734F]", amber: "bg-[#FCF1DC] text-[#8A5A0B]", red: "bg-[#FBE7E7] text-[#A33232]", grey: "bg-soft text-muted", teal: "bg-mint text-teal-deep", blue: "bg-sky text-[#245B7A]" };
export const Badge = ({ tone = "grey", children }: { tone?: string; children: React.ReactNode }) => <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", TONES[tone])}>{children}</span>;
export const DemoTag = () => <span className="ml-2 rounded-md bg-[#FCF1DC] px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-[#8A5A0B]">Demo</span>;

function withId(node: React.ReactNode, id: string, state: { done: boolean }): React.ReactNode {
  return React.Children.map(node, (c) => {
    if (!React.isValidElement(c) || state.done) return c;
    const el = c as React.ReactElement<any>;
    if (typeof el.type === "string" && ["input", "select", "textarea"].includes(el.type) && el.props.type !== "checkbox") { state.done = true; return React.cloneElement(el, { id: el.props.id || id }); }
    if (el.props?.children) return React.cloneElement(el, {}, withId(el.props.children, id, state));
    return c;
  });
}
export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  const id = React.useId();
  return <div><label htmlFor={id} className="label">{label}</label>{withId(children, id, { done: false })}{hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}{error && <p role="alert" className="mt-1 text-xs font-medium text-bad">{error}</p>}</div>;
}

type Toast = { id: number; msg: string; kind: "ok" | "err" };
const ToastCtx = createContext<(m: string, k?: "ok" | "err") => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState<Toast[]>([]);
  const push = useCallback((msg: string, kind: "ok" | "err" = "ok") => { const id = Date.now() + Math.random(); setT((x) => [...x, { id, msg, kind }]); setTimeout(() => setT((x) => x.filter((y) => y.id !== id)), 4500); }, []);
  return <ToastCtx.Provider value={push}>{children}
    <div aria-live="polite" className="fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">{t.map((x) => <div key={x.id} className={cx("card flex items-start gap-2 p-3 text-sm shadow-pop", x.kind === "err" ? "border-bad/40" : "border-ok/40")}>{x.kind === "err" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bad" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" />}<span>{x.msg}</span></div>)}</div></ToastCtx.Provider>;
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" aria-label={title} className={cx("card max-h-[92vh] w-full overflow-y-auto rounded-b-none p-5 shadow-pop sm:rounded-b-xl2 sm:p-6", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button aria-label="Close" onClick={onClose} className="rounded-lg p-1.5 hover:bg-soft"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}
export function Confirm({ open, title, text, confirmLabel = "Confirm", danger, onConfirm, onClose }: { open: boolean; title: string; text: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void | Promise<void>; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  return <Modal open={open} onClose={onClose} title={title}><p className="text-sm text-muted">{text}</p>
    <div className="mt-5 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancel</button>
      <button className={danger ? "btn-danger" : "btn-primary"} disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); onClose(); } }}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{confirmLabel}</button></div></Modal>;
}
export const PageHead = ({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) =>
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-extrabold">{title}</h1>{sub && <p className="mt-1 max-w-2xl text-sm text-muted">{sub}</p>}</div><div className="flex flex-wrap gap-2">{children}</div></div>;
export const Table = ({ head, children }: { head: string[]; children: React.ReactNode }) =>
  <div className="card overflow-x-auto"><table className="w-full min-w-[560px] border-collapse"><thead><tr>{head.map((h) => <th key={h} className="th">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;

export async function call<T = any>(url: string, opts: { method?: string; body?: any; form?: FormData } = {}): Promise<T> {
  const r = await fetch(url, { method: opts.method || (opts.body || opts.form ? "POST" : "GET"), headers: opts.body ? { "content-type": "application/json" } : undefined, body: opts.form || (opts.body ? JSON.stringify(opts.body) : undefined) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e: any = new Error(j.error || "Request failed."); e.field = j.field; e.status = r.status; if (r.status === 401 && typeof window !== "undefined" && !location.pathname.startsWith("/login")) location.href = "/login?expired=1"; throw e; }
  return j;
}
export function useData<T = any>(url: string | null) {
  const [data, setData] = useState<T | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(!!url);
  const reload = useCallback(async () => { if (!url) return; try { setData(await call<T>(url)); setError(""); } catch (e: any) { setError(e.message); } finally { setLoading(false); } }, [url]);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload, setData };
}
export const useCol = <T = any,>(name: string) => {
  const r = useData<T[]>(`/api/data/${name}`);
  const toast = useToast();
  const wrap = async (fn: () => Promise<any>, ok?: string) => { try { const x = await fn(); await r.reload(); if (ok) toast(ok); return x; } catch (e: any) { toast(e.message, "err"); throw e; } };
  return { ...r, rows: r.data || [],
    create: (b: any, ok = "Saved.") => wrap(() => call(`/api/data/${name}`, { body: b }), ok),
    update: (id: string, b: any, ok = "Saved.") => wrap(() => call(`/api/data/${name}/${id}`, { method: "PATCH", body: b }), ok),
    remove: (id: string, ok = "Deleted.") => wrap(() => call(`/api/data/${name}/${id}`, { method: "DELETE" }), ok) };
};
export const fmt = (n: any, d = 1) => (n == null || isNaN(n) ? "n/a" : Number(n).toFixed(d).replace(/\.0+$/, ""));
export const fdate = (s?: string) => (s ? new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "n/a");
