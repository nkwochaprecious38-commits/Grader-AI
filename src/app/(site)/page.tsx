import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import DashPreview from "@/components/DashPreview";
import { Icon } from "@/components/ui";
import { CORE, PROBLEMS, STEPS, AUDIENCES } from "@/lib/content";

const metrics = [["Active courses", "18"], ["Total students", "1,240"], ["Assignments created", "96"], ["Submissions received", "5,310"], ["Grading completion rate", "91%"], ["Average assessment score", "74%"], ["Outstanding grading tasks", "38"], ["Student performance trend", "Up 4 points"]];

export default function Home() {
  return <>
    <section className="bg-gradient-to-b from-mint-pale to-white">
      <div className="container-x grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="mb-4 inline-block rounded-full bg-mint px-3 py-1 text-xs font-semibold text-teal-deep">Smarter Grading. Better Feedback. Stronger Learning.</p>
          <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl">Grading Shouldn't Take Time Away From Teaching.</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">Grader AI helps educators assess assignments, automate repetitive grading tasks, deliver meaningful student feedback, and understand academic performance from one intelligent platform.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="btn-primary px-6 py-3 text-base">Get Started <ArrowRight className="h-4 w-4" /></Link><Link href="/platform" className="btn-ghost px-6 py-3 text-base">Explore the Platform</Link></div>
          <p className="mt-4 text-sm text-muted">AI suggests. Educators decide. No grade is published without instructor approval.</p>
        </div>
        <DashPreview />
      </div>
    </section>

    <section className="container-x py-20">
      <div className="max-w-2xl"><h2 className="text-3xl font-extrabold">Assessment is harder than it should be.</h2><p className="mt-3 text-muted">The same problems come up in classrooms, lecture halls and examination offices.</p></div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ul className="card grid gap-3 p-6">{PROBLEMS.map((p) => <li key={p} className="flex gap-3 text-sm"><X className="mt-0.5 h-4 w-4 shrink-0 text-bad" />{p}</li>)}</ul>
        <div className="card bg-mint-pale p-6">
          <h3 className="text-lg font-bold">One connected workflow</h3>
          <p className="mt-2 text-sm text-muted">Grader AI connects assessment creation, grading, feedback, and analytics so records stay together and every step informs the next.</p>
          <ol className="mt-5 space-y-3">{["Create assessments with answer keys and rubrics", "Grade with draft suggestions and instructor review", "Publish feedback students can act on", "Analyze results to find common learning gaps"].map((s, i) => <li key={s} className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm shadow-card"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal font-head text-xs font-bold text-white">{i + 1}</span>{s}</li>)}</ol>
        </div>
      </div>
    </section>

    <section className="bg-soft py-20"><div className="container-x">
      <div className="max-w-2xl"><h2 className="text-3xl font-extrabold">Core platform features</h2><p className="mt-3 text-muted">Everything in one workspace, designed to support educator judgment rather than replace it.</p></div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{CORE.map((f) => <Link key={f.title} href={f.href} className="card group p-5 transition hover:-translate-y-0.5 hover:border-wint">
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-mint text-teal"><Icon name={f.icon} className="h-5 w-5" /></div>
        <h3 className="font-bold">{f.title}</h3><p className="mt-2 text-sm text-muted">{f.text}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal">Learn more <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span></Link>)}</div>
    </div></section>

    <section className="container-x py-20">
      <h2 className="text-3xl font-extrabold">How Grader AI works</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-4">{STEPS.map((s, i) => <div key={s.t} className="relative card p-5"><span className="font-head text-4xl font-extrabold text-wint/60">{i + 1}</span><h3 className="mt-2 font-bold">{s.t}</h3><p className="mt-2 text-sm text-muted">{s.d}</p></div>)}</div>
    </section>

    <section className="bg-mint-pale py-20"><div className="container-x">
      <h2 className="text-3xl font-extrabold">Who uses Grader AI</h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{AUDIENCES.map((a) => <div key={a.t} className="card p-5"><h3 className="font-bold">{a.t}</h3><p className="mt-2 text-sm text-muted">{a.d}</p></div>)}</div>
      <p className="mt-6 text-sm"><Link href="/solutions" className="font-semibold text-teal underline">See all solutions</Link></p>
    </div></section>

    <section className="container-x py-20">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-3xl font-extrabold">Dashboard preview</h2><p className="mt-2 text-muted">A look at the workspace your team uses every day.</p></div><span className="rounded-md bg-[#FCF1DC] px-2.5 py-1 text-xs font-semibold uppercase text-[#8A5A0B]">Sample figures: demonstration data</span></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([l, v]) => <div key={l} className="card p-4"><p className="text-xs text-muted">{l}</p><p className="mt-1 font-head text-2xl font-extrabold text-teal-deep">{v}</p></div>)}</div>
      <div className="mt-6"><DashPreview compact /></div>
    </section>

    <section className="bg-teal-deep py-20 text-center"><div className="container-x">
      <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Make Every Assessment More Efficient.</h2>
      <p className="mx-auto mt-3 max-w-xl text-white/80">Spend Less Time Grading. More Time Teaching.</p>
      <Link href="/signup" className="btn-primary mt-8 px-7 py-3 text-base">Start With Grader AI</Link>
    </div></section>
  </>;
}
