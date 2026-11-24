"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import { BookOpen, ClipboardList, Inbox, CheckCircle2, Gauge } from "lucide-react";

const trend = [{ w: "W1", v: 62 }, { w: "W2", v: 66 }, { w: "W3", v: 64 }, { w: "W4", v: 71 }, { w: "W5", v: 74 }, { w: "W6", v: 73 }, { w: "W7", v: 78 }];
const bars = [{ q: "Q1", v: 88 }, { q: "Q2", v: 61 }, { q: "Q3", v: 79 }, { q: "Q4", v: 47 }, { q: "Q5", v: 72 }];
const stats = [{ i: ClipboardList, l: "Total assignments", v: "24" }, { i: Inbox, l: "Awaiting grading", v: "38" }, { i: CheckCircle2, l: "Completed assessments", v: "412" }, { i: Gauge, l: "Average class score", v: "74%" }];
const nav = ["Overview", "Courses", "Assignments", "Submissions", "AI Grading", "Rubrics", "Gradebook", "Analytics"];

/** Illustration of the product with demonstration data. */
export default function DashPreview({ compact }: { compact?: boolean }) {
  return <div className="overflow-hidden rounded-xl2 border border-line bg-white shadow-pop" aria-label="Grader AI dashboard preview with demonstration data">
    <div className="flex">
      <aside className="hidden w-44 shrink-0 bg-teal-deep p-4 text-white sm:block">
        <p className="mb-4 font-head text-sm font-extrabold">Grader AI</p>
        <ul className="space-y-1 text-xs">{nav.map((n, i) => <li key={n} className={`rounded-lg px-2.5 py-2 ${i === 0 ? "bg-white/15 font-semibold" : "text-white/75"}`}>{n}</li>)}</ul>
      </aside>
      <div className="min-w-0 flex-1 bg-soft p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between"><p className="font-head text-sm font-bold text-ink">Overview</p><span className="rounded-md bg-[#FCF1DC] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#8A5A0B]">Demonstration data</span></div>
        <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">{stats.map((s) => <div key={s.l} className="min-w-0 rounded-xl border border-line bg-white p-3"><s.i className="mb-2 h-4 w-4 text-teal" /><p className="font-head text-xl font-extrabold text-ink">{s.v}</p><p className="break-words text-[11px] leading-tight text-muted">{s.l}</p></div>)}</div>
        <div className="mt-2.5 grid gap-2.5 md:grid-cols-5">
          <div className="rounded-xl border border-line bg-white p-3 md:col-span-3"><p className="mb-1 text-xs font-semibold text-ink">Student performance trend</p>
            <div className="h-36"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ left: -24, right: 4, top: 4 }}><defs><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#39BDAA" stopOpacity={0.35} /><stop offset="100%" stopColor="#39BDAA" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="w" tick={{ fontSize: 10, fill: "#68757A" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "#68757A" }} axisLine={false} tickLine={false} domain={[50, 90]} /><Tooltip /><Area type="monotone" dataKey="v" stroke="#176B68" strokeWidth={2} fill="url(#gp)" /></AreaChart></ResponsiveContainer></div></div>
          <div className="rounded-xl border border-line bg-white p-3 md:col-span-2"><p className="text-xs font-semibold text-ink">Grading progress</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-soft"><div className="h-full w-[91%] rounded-full bg-wint" /></div><p className="mt-1 text-[11px] text-muted">412 of 450 complete</p>
            <p className="mt-3 text-xs font-semibold text-ink">Question averages</p><div className="h-16"><ResponsiveContainer width="100%" height="100%"><BarChart data={bars} margin={{ left: -30, top: 4 }}><XAxis dataKey="q" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><Bar dataKey="v" fill="#39BDAA" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
        </div>
        {!compact && <div className="mt-2.5 rounded-xl border border-line bg-white p-3"><p className="mb-2 text-xs font-semibold text-ink">Recent instructor activity</p>
          {[["Approved 12 grades", "Cell Biology Quiz", "10 min ago"], ["Updated rubric", "Short answer: cell biology", "1 hour ago"], ["Published feedback", "Midterm Examination", "Yesterday"]].map((r) => <div key={r[0]} className="flex items-center justify-between border-t border-line py-1.5 text-[11px] first:border-0"><span className="font-medium text-charcoal">{r[0]}</span><span className="hidden text-muted sm:inline">{r[1]}</span><span className="text-muted">{r[2]}</span></div>)}</div>}
      </div>
    </div>
  </div>;
}
