"use client";
import { PageHead, Spinner, Empty, useData } from "@/components/ui";
export default function Courses() {
  const { data, loading } = useData<any>("/api/student/overview"); if (loading) return <Spinner />;
  return <><PageHead title="My Courses" />{data?.courses.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.courses.map((c: any) => <div key={c.id} className="card p-5"><p className="text-xs font-semibold text-teal">{c.code}</p><h2 className="font-bold">{c.title}</h2><p className="mt-1 text-sm text-muted">{c.term}</p><p className="mt-3 text-sm">{data.assignments.filter((a: any) => a.courseId === c.id).length} assessments</p></div>)}</div> : <div className="card"><Empty title="You are not enrolled in any course yet" /></div>}</>;
}
