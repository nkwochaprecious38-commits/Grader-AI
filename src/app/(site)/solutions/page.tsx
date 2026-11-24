import type { Metadata } from "next";
import Link from "next/link";
import { SOLUTIONS } from "@/lib/content";
export const metadata: Metadata = { title: "Solutions" };

export default function Solutions() {
  return <>
    <section className="bg-gradient-to-b from-mint-pale to-white py-16 lg:py-20"><div className="container-x max-w-4xl">
      <p className="text-sm font-semibold text-teal">Solutions</p>
      <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Assessment Solutions for Every Learning Environment.</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">Different institutions assess in different ways. Grader AI adapts to the size, formats and oversight each one needs.</p>
      <div className="mt-8 flex flex-wrap gap-2">{SOLUTIONS.map((s) => <a key={s.id} href={`#${s.id}`} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium hover:border-wint">{s.t}</a>)}</div>
    </div></section>
    <div className="container-x space-y-6 py-14">{SOLUTIONS.map((s, i) => <section key={s.id} id={s.id} className="card scroll-mt-24 grid gap-6 p-6 sm:p-8 lg:grid-cols-5">
      <div className="lg:col-span-2"><span className="font-head text-xs font-bold text-teal">{String(i + 1).padStart(2, "0")}</span><h2 className="mt-1 text-2xl font-extrabold">{s.t}</h2><p className="mt-3 text-sm text-muted">{s.d}</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3"><div className="rounded-xl bg-soft p-5"><h3 className="text-sm font-bold">The challenge</h3><p className="mt-2 text-sm text-muted">{s.challenge}</p></div><div className="rounded-xl bg-mint-pale p-5"><h3 className="text-sm font-bold">How Grader AI helps</h3><p className="mt-2 text-sm text-muted">{s.help}</p></div></div>
    </section>)}</div>
    <section className="bg-teal-deep py-14 text-center"><h2 className="text-2xl font-extrabold text-white">Find the right setup for your institution.</h2><div className="mt-6 flex justify-center gap-3"><Link href="/signup" className="btn-primary">Get Started</Link><Link href="/pricing" className="btn bg-white/10 text-white hover:bg-white/20">View Pricing</Link></div></section>
  </>;
}
