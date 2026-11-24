import { api, json, HttpError } from "@/lib/http";
import { tx, col, notify, audit } from "@/lib/store";
import { saveFiles, upsertSubmission } from "@/lib/submit";

export const POST = api(async (req, _c, s) => {
  if (!s!.studentId) throw new HttpError(403, "Your account is not linked to a student record. Contact your instructor.");
  const fd = await req.formData();
  const assignmentId = String(fd.get("assignmentId") || "");
  let answers: any = {}; try { answers = JSON.parse(String(fd.get("answers") || "{}")); } catch { throw new HttpError(400, "Invalid answers."); }
  for (const k of Object.keys(answers)) answers[k] = String(answers[k]).slice(0, 20000);
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const hasText = Object.values(answers).some((v: any) => String(v).trim());
  if (!files.length && !hasText) throw new HttpError(400, "Add an answer or upload a file before submitting.");
  const saved = await saveFiles(files);
  const sub = await tx((db) => {
    const asg = col(db, "assignments").find((a) => a.id === assignmentId && a.orgId === s!.org.id && a.status === "published");
    if (!asg) throw new HttpError(404, "Assignment not found or not open for submission.");
    const st = col(db, "students").find((x) => x.id === s!.studentId);
    if (asg.courseId && !(st?.courseIds || []).includes(asg.courseId)) throw new HttpError(403, "You are not enrolled in this course.");
    if (asg.release && new Date() < new Date(asg.release)) throw new HttpError(400, "This assignment has not been released yet.");
    const r = upsertSubmission(db, s!.org.id, asg, s!.studentId!, answers, saved, s!.user.name, true);
    audit(db, s!.org.id, s!.user, "submission.received", { assignment: asg.title });
    return r;
  });
  return json({ ok: true, id: sub.id });
}, { roles: ["student"] });
