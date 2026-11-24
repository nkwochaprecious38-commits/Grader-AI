import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { FEATURES } from "@/lib/content";
export const metadata: Metadata = { title: "Features" };

const cats = [...new Set(FEATURES.map((f) => f.cat))];

function RubricPreview() {
  return <div className="card p-4 text-xs"><p className="mb-2 font-head text-sm font-bold">Rubric: Short answer</p>{[["Identifies the organelle", "2 / 2"], ["Explains the energy output", "2 / 2"], ["Mentions the inputs", "0 / 1"]].map(([a, b]) => <div key={a} className="flex justify-between border-t border-line py-2"><span>{a}</span><span className="font-semibold text-teal-deep">{b}</span></div>)}<div className="flex justify-between border-t border-line pt-2 font-bold"><span>Question total</span><span>4 / 5</span></div><p className="mt-2 text-[10px] uppercase tracking-wide text-muted">Sample interface: demonstration data</p></div>;
}
function ReviewPreview() {
  return <div className="card p-4 text-xs"><div className="flex items-center justify-between"><p className="font-head text-sm font-bold">AI suggestion</p><span className="rounded-full bg-[#FCF1DC] px-2 py-0.5 font-medium text-[#8A5A0B]">Review needed</span></div><p className="mt-2 rounded-lg bg-soft p-2 text-muted">Answer includes mitochondria and ATP. Glucose and oxygen were not mentioned.</p><div className="mt-3 flex items-center justify-between"><span>Suggested score</span><span className="font-bold">4 / 5</span></div><div className="mt-3 flex gap-2"><span className="rounded-lg bg-wint px-3 py-1.5 font-semibold text-ink">Approve</span><span className="rounded-lg border border-line px-3 py-1.5">Edit</span><span className="rounded-lg border border-line px-3 py-1.5">Reject</span></div><p className="mt-2 text-[10px] uppercase tracking-wide text-muted">Sample interface: demonstration data</p></div>;
}
function GradebookPreview() {
  return <div className="card overflow-hidden text-xs"><table className="w-full"><thead><tr className="bg-soft text-left text-muted"><th className="p-2">Student</th><th className="p-2">Score</th><th className="p-2">Status</th></tr></thead><tbody>{[["Amara Okafor", "9 / 9", "Published"], ["Liam Chen", "9 / 9", "Published"], ["Sofia Rossi", "3 / 9", "Approved"]].map((r) => <tr key={r[0]} className="border-t border-line"><td className="p-2">{r[0]}</td><td className="p-2">{r[1]}</td><td className="p-2"><span className="rounded-full bg-[#E4F5EE] px-2 py-0.5 text-[#17734F]">{r[2]}</span></td></tr>)}</tbody></table><p className="p-2 text-[10px] uppercase tracking-wide text-muted">Sample interface: demonstration data</p></div>;
}

export default function Features() {
  return <>
    <section className="bg-gradient-to-b from-mint-pale to-white py-16 lg:py-20"><div className="container-x grid items-center gap-10 lg:grid-cols-2">
      <div><p className="text-sm font-semibold text-teal">Features</p><h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Everything You Need to Assess, Grade, and Improve Learning.</h1>
        <p className="mt-5 text-lg text-muted">Twenty eight capabilities across grading, submissions, assessments, rubrics, feedback, grades, analytics and team workflows.</p>
        <div className="mt-6 flex flex-wrap gap-2">{cats.map((c) => <a key={c} href={`#cat-${c}`} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium hover:border-wint">{c}</a>)}</div></div>
      <div className="grid gap-4 sm:grid-cols-2"><RubricPreview /><ReviewPreview /><div className="sm:col-span-2"><GradebookPreview /></div></div>
    </div></section>
    <div className="container-x space-y-14 py-14">{cats.map((c) => <section key={c} id={`cat-${c}`} className="scroll-mt-24">
      <h2 className="text-2xl font-extrabold">{c}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{FEATURES.filter((f) => f.cat === c).map((f) => <article key={f.id} id={f.id} className="card scroll-mt-24 p-5">
        <h3 className="font-bold">{f.t}</h3><p className="mt-2 text-sm text-muted">{f.d}</p>
        <p className="mt-3 flex gap-2 rounded-lg bg-mint-pale p-3 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" /><span>{f.b}</span></p></article>)}</div></section>)}</div>
    <section className="bg-teal-deep py-14 text-center"><h2 className="text-2xl font-extrabold text-white">Try these workflows with your own assessments.</h2><Link href="/signup" className="btn-primary mt-6">Get Started</Link></section>
  </>;
}
