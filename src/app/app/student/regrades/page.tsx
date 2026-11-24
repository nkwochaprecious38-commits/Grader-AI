"use client";
import { PageHead, Spinner, Empty, Badge, useData, fdate } from "@/components/ui";
export default function StudentRegrades() {
  const { data, loading } = useData<any>("/api/student/overview"); if (loading) return <Spinner />;
  return <><PageHead title="Regrade Requests" sub="Track the status of your requests. Start a new one from Grades and Feedback." />
    {data.regrades.length ? <div className="space-y-4">{data.regrades.map((r: any) => <div key={r.id} className="card p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">{r.assignmentTitle}{r.questionId ? `: ${r.questionId}` : ""}</h2><Badge tone={r.status === "open" ? "amber" : "green"}>{r.status === "open" ? "Waiting for instructor" : "Resolved"}</Badge></div>
      <p className="mt-2 text-sm text-muted">Sent {fdate(r.createdAt)}: {r.reason}</p>{r.response && <p className="mt-3 rounded-xl bg-mint-pale p-3 text-sm"><strong>Instructor response:</strong> {r.response}</p>}</div>)}</div> : <div className="card"><Empty title="No requests yet" /></div>}</>;
}
