"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/content";
import { cx } from "./ui";

/** Grader AI logo. Assets live in public/ (logo.png full, logo-icon.png icon only). Dark backgrounds use the icon on a white tile. */
export function Brand({ light }: { light?: boolean }) {
  return <Link href="/" className="flex items-center gap-2.5" aria-label="Grader AI home">
    {light ? <>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white"><img src="/logo-icon.png" alt="" width={28} height={28} className="h-7 w-7" /></span>
      <span className="font-head text-lg font-extrabold text-white">Grader AI</span></>
      : <img src="/logo.png" alt="Grader AI" width={442} height={359} className="h-[58px] w-auto" />}
  </Link>;
}
export default function Nav() {
  const p = usePathname(); const [open, setOpen] = useState(false);
  const link = (l: { href: string; label: string }) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} aria-current={p === l.href ? "page" : undefined}
    className={cx("rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-mint-pale", p === l.href ? "text-teal-deep bg-mint-pale" : "text-charcoal")}>{l.label}</Link>;
  return <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
    <div className="container-x flex h-[76px] items-center justify-between">
      <Brand />
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">{NAV_LINKS.map(link)}</nav>
      <div className="hidden items-center gap-2 lg:flex"><Link href="/login" className="btn-ghost">Log In</Link><Link href="/signup" className="btn-primary">Get Started</Link></div>
      <button className="rounded-lg p-2 lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <div className="border-t border-line bg-white lg:hidden"><nav className="container-x flex flex-col gap-1 py-3" aria-label="Mobile">{NAV_LINKS.map(link)}
      <div className="mt-2 grid grid-cols-2 gap-2"><Link href="/login" onClick={() => setOpen(false)} className="btn-ghost">Log In</Link><Link href="/signup" onClick={() => setOpen(false)} className="btn-primary">Get Started</Link></div></nav></div>}
  </header>;
}
export function Footer() { return <footer className="border-t border-line py-8 text-center text-sm text-muted">© 2026 Grader AI</footer>; }
