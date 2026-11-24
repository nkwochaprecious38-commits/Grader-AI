import { api, json } from "@/lib/http";
import { read, col } from "@/lib/store";
import { analytics } from "@/lib/analytics";
import { STAFF } from "@/lib/roles";

export const GET = api(async (_r, _c, s) => json(await read((db) => {
  const o = s!.org.id; const f = (c: string) => col(db, c).filter((x) => x.orgId === o);
  const subs = f("submissions"); const asg = f("assignments"); const A = analytics(db, o);
  const graded = A.assignments.filter((a) => a.avg != null);
  return {
    demo: [...f("courses"), ...f("students"), ...asg, ...subs].some((x) => x.demo),
    courses: f("courses").filter((c) => !c.archived).length, students: f("students").length,
    activeAssignments: asg.filter((a) => a.status === "published").length, submissions: subs.length,
    pending: subs.filter((x) => !x.approved).length, completed: subs.filter((x) => x.approved).length,
    avg: graded.length ? graded.reduce((x, a) => x + a.avg!, 0) / graded.length : null,
    deadlines: asg.filter((a) => a.status === "published" && a.due && a.due >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5).map((a) => ({ id: a.id, title: a.title, due: a.due })),
    activity: f("audit").slice(0, 8).map((a) => ({ id: a.id, at: a.createdAt, who: a.actorName, what: a.action })),
    trend: A.trend,
  };
})), { roles: STAFF });
