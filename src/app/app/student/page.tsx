"use client";
import Link from "next/link";
import { PageHead, Spinner, Badge, useData, fdate, Empty } from "@/components/ui";
import { useSession } from "@/components/Shell";

export default function StudentHome() {
  const s = useSession(); const { data, loading } = useData<any>("/api/student/overview");
  if (loading) return <Spinner />;
  if (!data?.student) return <div className="card"><Empty title="Your account is not linked to a student record" text="Ask your instructor to invite you using the email address on your student record." /></div>;
  const subOf = (id: string) => data.submissions.find((x: any) => x.assignmentId === id);
  const open = data.assignments.filter((a: any) => !subOf(a.id)); const graded = data.submissions.filter((x: any) => x.published);
  return <>
    <PageHead title={`Hello, ${s.user.name.split(" ")[0]}`} sub="Your courses, assessments and results." />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[["Enrolled courses", data.courses.length], ["To submit", open.length], ["Submitted", data.submissions.length], ["Results published", graded.length]].map(([l, v]) => <div key={l as string} className="card p-4"><p className="font-head text-3xl font-extrabold text-teal-deep">{v}</p><p className="text-xs text-muted">{l}</p></div>)}</div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="card p-5"><h2 className="font-bold">Due soon</h2>{open.length ? open.slice(0, 5).map((a: any) => <div key={a.id} className="flex items-center justify-between border-t border-line py-2.5 text-sm first:border-0"><span className="font-medium">{a.title}</span><span className="text-muted">{fdate(a.due)}</span></div>) : <p className="py-4 text-sm text-muted">Nothing waiting for you.</p>}<Link href="/app/student/assessments" className="btn-primary btn-sm mt-3">Open assessments</Link></div>
      <div className="card p-5"><h2 className="font-bold">Notifications</h2>{data.notifications.length ? data.notifications.slice(0, 5).map((n: any) => <div key={n.id} className="border-t border-line py-2.5 text-sm first:border-0"><p className="font-medium">{n.title}</p><p className="text-xs text-muted">{n.body} · {fdate(n.createdAt)}</p></div>) : <p className="py-4 text-sm text-muted">No notifications.</p>}</div></div>
  </>;
}
