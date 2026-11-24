"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHead, Spinner, Empty, useData } from "@/components/ui";
export default function Progress() {
  const { data, loading } = useData<any>("/api/student/overview"); if (loading) return <Spinner />;
  const rows = data.submissions.filter((s: any) => s.published).map((s: any) => { const a = data.assignments.find((x: any) => x.id === s.assignmentId); return { n: (a?.title || "").slice(0, 20), pct: a?.total ? Math.round((s.score / a.total) * 100) : 0 }; });
  const avg = rows.length ? Math.round(rows.reduce((x: number, y: any) => x + y.pct, 0) / rows.length) : null;
  return <><PageHead title="Progress" sub="Based only on results that have been published to you." />
    {rows.length ? <><div className="card mb-6 w-48 p-4"><p className="text-xs text-muted">Average</p><p className="font-head text-3xl font-extrabold text-teal-deep">{avg}%</p></div><div className="card p-5"><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} margin={{ left: -20 }}><CartesianGrid stroke="#E1E7E8" vertical={false} /><XAxis dataKey="n" tick={{ fontSize: 11 }} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip formatter={(v) => v + "%"} /><Bar dataKey="pct" name="Score" fill="#39BDAA" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div></> : <div className="card"><Empty title="No published results yet" /></div>}</>;
}
