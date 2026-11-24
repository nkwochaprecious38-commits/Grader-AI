import { col, uid, now } from "./store";

export function linkStudent(db: any, orgId: string, user: any, studentId?: string) {
  const students = col(db, "students");
  const s = students.find((x) => x.id === studentId) || students.find((x) => x.orgId === orgId && x.email?.toLowerCase() === user.email && !x.userId);
  if (s) { s.userId = user.id; return; }
  students.push({ id: uid("s_"), orgId, createdAt: now(), name: user.name, email: user.email, userId: user.id, courseIds: [] });
}
