"use client";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BookOpen, Users, ClipboardList, Inbox, Hourglass, CheckCircle2, Gauge } from "lucide-react";
import { useSession } from "@/components/Shell";
import { PageHead, Spinner, useData, fdate, fmt, Empty, DemoTag } from "@/components/ui";

export default function Overview() {
  const s = useSession(); const { data: d, loading, error } = useData<any>("/api/overview");
  if (loading) return <Spinner />; if (error || !d) return <p className="text-bad">{error}</p>;
  const stats = [[BookOpen, "Total courses", d.courses], [Users, "Total students", d.students], [ClipboardList, "Active assignments", d.activeAssignments], [Inbox, "Total submissions", d.submissions], [Hourglass, "Pending grading tasks", d.pending], [CheckCircle2, "Completed grading tasks", d.completed], [Gauge, "Average class performance", d.avg == null ? "n/a" : fmt(d.avg) + "%"]] as const;
  return <>
    <PageHead title={`Welcome, ${s.user.name.split(" ")[0]}`} sub={`${s.org.name}`} />
    {d.demo && <div className="mb-6 rounded-xl border border-warn/40 bg-[#FCF1DC] p-4 text-sm text-[#6F4708]">This workspace contains <strong>demonstration data</strong>, labelled Demo. Remove it any time from <Link className="font-semibold underline" href="/app/settings">Settings</Link> before entering your own records.</div>}
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map(([I, l, v]) => <div key={l} className="card p-4"><I className="h-5 w-5 text-teal" /><p className="mt-3 font-head text-2xl font-extrabold text-ink">{v}</p><p className="text-xs text-muted">{l}</p></div>)}</div>
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="card p-5 lg:col-span-2"><h2 className="font-bold">Score trend of approved grades {d.demo && <DemoTag />}</h2>
        {d.trend.length > 1 ? <div className="mt-3 h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={d.trend.map((t: any, i: number) => ({ n: i + 1, pct: Math.round(t.pct) }))} margin={{ left: -20 }}><CartesianGrid stroke="#E1E7E8" vertical={false} /><XAxis dataKey="n" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip formatter={(v) => v + "%"} labelFormatter={(l) => "Graded item " + l} /><Area type="monotone" dataKey="pct" stroke="#176B68" strokeWidth={2} fill="#39BDAA" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></div> : <Empty title="No trend yet" text="Approved grades will appear here as you grade." />}</div>
      <div className="card p-5"><h2 className="font-bold">Upcoming deadlines</h2>{d.deadlines.length ? d.deadlines.map((x: any) => <div key={x.id} className="flex justify-between border-t border-line py-2.5 text-sm first:border-0"><span className="font-medium">{x.title}</span><span className="text-muted">{fdate(x.due)}</span></div>) : <Empty title="No upcoming deadlines" />}</div>
    </div>
    <div className="card mt-6 p-5"><h2 className="font-bold">Recent activity</h2>{d.activity.length ? d.activity.map((a: any) => <div key={a.id} className="flex flex-wrap justify-between gap-2 border-t border-line py-2.5 text-sm first:border-0"><span><strong>{a.who}</strong> <span className="text-muted">{a.what.replace(/[._]/g, " ")}</span></span><span className="text-xs text-muted">{fdate(a.at)}</span></div>) : <Empty title="No activity yet" />}</div>
  </>;
}
