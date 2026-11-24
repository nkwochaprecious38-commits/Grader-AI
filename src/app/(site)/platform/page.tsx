import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui";
import { MODULES } from "@/lib/content";
export const metadata: Metadata = { title: "Platform" };

export default function Platform() {
  return <>
    <section className="bg-gradient-to-b from-mint-pale to-white py-16 lg:py-20"><div className="container-x max-w-4xl">
      <p className="text-sm font-semibold text-teal">Platform</p>
      <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">One Intelligent Platform for Every Assessment.</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">Grader AI connects assignment creation, student submissions, AI assisted grading, feedback, and academic analytics, so each stage of assessment feeds the next.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="btn-primary">Get Started</Link><Link href="/features" className="btn-ghost">Browse all features</Link></div>
    </div></section>

    <section className="container-x py-16">
      <h2 className="text-2xl font-extrabold">How the modules work together</h2>
      <div className="mt-8 card p-6 sm:p-8">
        <div className="grid items-stretch gap-3 md:grid-cols-5">
          {[["Assessment Management", "Assignments, answer keys, deadlines"], ["Submission Management", "Digital, PDF, image and code"], ["AI Grading Engine", "Draft marks and rationale"], ["Feedback Management", "Comments, annotations, publishing"], ["Academic Intelligence", "Question and rubric analytics"]].map(([t, d], i, a) => (
            <div key={t} className="relative flex flex-col rounded-xl border border-line bg-mint-pale p-4"><span className="font-head text-xs font-bold text-teal">Step {i + 1}</span><p className="mt-1 text-sm font-bold">{t}</p><p className="mt-1 text-xs text-muted">{d}</p>{i < a.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-white text-teal md:block" />}</div>))}
        </div>
        <div className="mt-3 rounded-xl border border-dashed border-teal/40 bg-white p-4 text-center text-sm"><strong className="text-ink">Rubric Management</strong> sits across every stage: one set of criteria shapes the assignment, guides the AI suggestion, structures feedback and drives analytics.</div>
        <div className="mt-3 rounded-xl bg-teal-deep p-4 text-center text-sm font-medium text-white">Instructor review and approval sits between every suggestion and every published grade.</div>
      </div>
    </section>

    <section className="bg-soft py-16"><div className="container-x">
      <h2 className="text-2xl font-extrabold">Platform modules</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{MODULES.map((m) => <div key={m.t} className="card p-6"><div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-mint text-teal"><Icon name={m.icon} className="h-5 w-5" /></div><h3 className="text-lg font-bold">{m.t}</h3><p className="mt-2 text-sm text-muted">{m.d}</p></div>)}</div>
    </div></section>

    <section className="container-x py-16"><div className="grid gap-6 md:grid-cols-3">
      {[["Educator control", "AI generated marks are suggestions. Instructors can edit, approve or reject each one, and every override is recorded."], ["Protected records", "Each organization's data is separated, students see only their own published results, and grade changes are written to an audit log."], ["Honest limits", "Handwriting that cannot be read reliably is flagged for review instead of guessed, and integrations stay inactive until configured and tested."]].map(([t, d]) => <div key={t} className="card p-6"><h3 className="font-bold">{t}</h3><p className="mt-2 text-sm text-muted">{d}</p></div>)}
    </div></section>
    <section className="bg-teal-deep py-14 text-center"><h2 className="text-2xl font-extrabold text-white">See the platform in your own workspace.</h2><Link href="/signup" className="btn-primary mt-6">Get Started</Link></section>
  </>;
}
