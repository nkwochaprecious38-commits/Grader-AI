import type { Metadata } from "next";
import { PLANS, FAQ } from "@/lib/content";
import { ExternalLink } from "lucide-react";
export const metadata: Metadata = { title: "Pricing" };

export default function Pricing() {
  return <>
    <section className="bg-gradient-to-b from-mint-pale to-white py-16 text-center"><div className="container-x max-w-3xl">
      <p className="text-sm font-semibold text-teal">Pricing</p><h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Choose the plan that fits your institution.</h1>
      <p className="mt-4 text-lg text-muted">Each plan opens its secure Selar checkout page, where current pricing and billing details are shown.</p></div></section>
    <section className="container-x pb-8"><div className="grid items-stretch gap-6 lg:grid-cols-3">{PLANS.map((p) => <div key={p.id} className={`card relative flex flex-col p-7 ${p.featured ? "border-2 border-wint shadow-pop lg:-my-3 lg:py-10" : ""}`}>
      {p.featured && <span className="absolute -top-3 left-7 rounded-full bg-wint px-3 py-1 text-xs font-bold text-ink">Most popular</span>}
      <h2 className="text-xl font-extrabold">{p.name}</h2>
      <p className="mt-3 flex-1 text-sm text-muted">{p.d}</p>
      <p className="mt-6 rounded-lg bg-soft px-3 py-2 text-sm font-medium text-ink">{p.price}</p>
      <a href={p.url} target="_blank" rel="noopener noreferrer" className={`${p.featured ? "btn-primary" : "btn-dark"} mt-5 w-full py-3`}>{p.cta}<ExternalLink className="h-4 w-4" /></a>
    </div>)}</div>
      <p className="mt-6 text-center text-xs text-muted">Plan inclusions are confirmed on each checkout page.</p></section>
    <section className="container-x max-w-3xl py-14"><h2 className="text-2xl font-extrabold">Pricing questions</h2>
      <div className="mt-6 divide-y divide-line rounded-xl2 border border-line bg-white">{FAQ.map(([q, a]) => <details key={q} className="group p-5"><summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">{q}</summary><p className="mt-2 text-sm text-muted">{a}</p></details>)}</div></section>
  </>;
}
