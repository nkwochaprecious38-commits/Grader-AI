import { api, json, HttpError } from "@/lib/http";
import { tx, col, audit } from "@/lib/store";
import { saveFiles, upsertSubmission } from "@/lib/submit";
import { STAFF } from "@/lib/roles";

/** Staff upload of scanned or handwritten work for a named student. */
export const POST = api(async (req, _c, s) => {
  const fd = await req.formData();
  const assignmentId = String(fd.get("assignmentId") || ""), studentId = String(fd.get("studentId") || "");
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const text = String(fd.get("text") || "").slice(0, 20000);
  if (!files.length && !text.trim()) throw new HttpError(400, "Choose at least one file or enter the answer text.");
  const saved = await saveFiles(files);
  const sub = await tx((db) => {
    const asg = col(db, "assignments").find((a) => a.id === assignmentId && a.orgId === s!.org.id);
    const st = col(db, "students").find((x) => x.id === studentId && x.orgId === s!.org.id);
    if (!asg) throw new HttpError(404, "Choose an assignment."); if (!st) throw new HttpError(404, "Choose a student.");
    const sub = upsertSubmission(db, s!.org.id, asg, st.id, text ? { q1: text } : {}, saved, s!.user.name, false);
    if (saved.length) sub.needsTranscription = true;
    audit(db, s!.org.id, s!.user, "submission.uploaded", { assignment: asg.title, student: st.name, files: saved.length });
    return sub;
  });
  return json({ ok: true, id: sub.id });
}, { roles: STAFF });
