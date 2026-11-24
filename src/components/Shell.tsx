"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, X, ShieldAlert } from "lucide-react";
import { NAV, STUDENT_NAV, ROLE_LABEL, type Role } from "@/lib/roles";
import { Icon, call, cx, useData, fdate } from "./ui";
import { Brand } from "./Nav";

export type SessionT = { user: { id: string; name: string; email: string }; org: { id: string; name: string; type: string; demo?: boolean }; role: Role; title?: string; studentId?: string | null };
const Ctx = createContext<SessionT>(null as any);
export const useSession = () => useContext(Ctx);

export default function Shell({ session, children }: { session: SessionT; children: React.ReactNode }) {
  const p = usePathname(); const r = useRouter(); const [open, setOpen] = useState(false); const [bell, setBell] = useState(false);
  const student = session.role === "student";
  const items = (student ? STUDENT_NAV : NAV).filter((n) => n.roles.includes(session.role));
  const onStudentArea = p === "/app/student" || p.startsWith("/app/student/");
  const allowed = student ? onStudentArea : !onStudentArea && (p === "/app" || items.some((n) => n.href !== "/app" && (p === n.href || p.startsWith(n.href + "/"))));
  useEffect(() => { if (student && !onStudentArea) r.replace("/app/student"); if (!student && onStudentArea) r.replace("/app"); }, [student, onStudentArea, r]);
  useEffect(() => setOpen(false), [p]);
  const notes = useData<any>(student ? null : "/api/data/notifications");
  const unread = (notes.data || []).filter((n: any) => !n.read && (!n.userId || n.userId === session.user.id)).length;
  const logout = async () => { await call("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; };
  const active = (h: string) => (h === "/app" || h === "/app/student" ? p === h : p === h || p.startsWith(h + "/"));

  const side = <div className="flex h-full flex-col bg-teal-deep text-white">
    <div className="flex h-16 items-center justify-between px-5"><Brand light /><button className="lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
    <div className="px-5 pb-3"><p className="truncate text-xs text-white/60">{student ? "Student portal" : "Workspace"}</p><p className="truncate text-sm font-semibold">{session.org.name}</p></div>
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" aria-label="Workspace">{items.map((n) => <Link key={n.key} href={n.href} aria-current={active(n.href) ? "page" : undefined}
      className={cx("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition", active(n.href) ? "bg-white/15 font-semibold text-white" : "text-white/75 hover:bg-white/10 hover:text-white")}><Icon name={n.icon} className="h-4 w-4 shrink-0" />{n.label}</Link>)}</nav>
    <div className="border-t border-white/10 p-4"><p className="truncate text-sm font-semibold">{session.user.name}</p><p className="truncate text-xs text-white/60">{ROLE_LABEL[session.role]}</p>
      <button onClick={logout} className="mt-3 flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"><LogOut className="h-4 w-4" />Log out</button></div>
  </div>;

  return <Ctx.Provider value={session}><div className="min-h-screen bg-soft">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{side}</aside>
    {open && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} /><aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">{side}</aside></div>}
    <div className="lg:pl-64">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-8">
        <button className="rounded-lg p-2 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button>
        <p className="hidden truncate text-sm text-muted lg:block">{ROLE_LABEL[session.role]} · {session.org.name}</p>
        <div className="relative ml-auto">
          {!student && <button className="relative rounded-lg p-2 hover:bg-soft" aria-label="Notifications" onClick={() => setBell(!bell)}><Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-bad" />}</button>}
          {bell && <div className="card absolute right-0 mt-2 w-80 max-w-[85vw] p-3 shadow-pop"><p className="mb-2 text-sm font-bold">Notifications</p>
            {(notes.data || []).slice(0, 6).map((n: any) => <div key={n.id} className="border-t border-line py-2 text-sm first:border-0"><p className="font-medium">{n.title}</p><p className="text-xs text-muted">{n.body} · {fdate(n.createdAt)}</p></div>)}
            {!notes.data?.length && <p className="py-4 text-center text-sm text-muted">No notifications.</p>}</div>}
        </div>
      </header>
      <main className="p-4 sm:p-8" id="main">
        {allowed ? children : <div className="card mx-auto mt-10 max-w-md p-8 text-center"><ShieldAlert className="mx-auto h-10 w-10 text-warn" /><h1 className="mt-3 text-xl font-extrabold">Not available for your role</h1><p className="mt-2 text-sm text-muted">Ask a workspace administrator if you need access to this area.</p><Link href={student ? "/app/student" : "/app"} className="btn-primary mt-5">Back to overview</Link></div>}
      </main>
    </div></div></Ctx.Provider>;
}
