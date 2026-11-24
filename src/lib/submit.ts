import { DB, col, uid, now, notify } from "./store";
import { admin, BUCKET } from "./supa";
import { HttpError } from "./http";

const ALLOWED: Record<string, string> = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", txt: "text/plain", py: "text/plain", js: "text/plain", java: "text/plain", cpp: "text/plain", c: "text/plain", ts: "text/plain", md: "text/plain" };
// Hosts such as Vercel reject request bodies above about 4.5 MB, so the limit applies to one upload in total.
export const MAX_BYTES = Number(process.env.MAX_UPLOAD_MB || 4) * 1024 * 1024;

export async function saveFiles(files: File[]) {
  const out: any[] = [];
  if (files.reduce((n, f) => n + f.size, 0) > MAX_BYTES) throw new HttpError(400, `Files in one upload must total less than ${Math.round(MAX_BYTES / 1048576)} MB. Upload large scans in several batches.`);
  if (files.length > 12) throw new HttpError(400, "Upload at most 12 files at a time.");
  for (const f of files) {
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED[ext]) throw new HttpError(400, `${f.name}: this file type is not accepted. Use PDF, PNG, JPG, WEBP or a plain text or code file.`);
    if (f.size > MAX_BYTES) throw new HttpError(400, `${f.name} is larger than ${Math.round(MAX_BYTES / 1048576)} MB.`);
    const id = uid("f_") + "." + ext;
    const { error } = await admin().storage.from(BUCKET).upload(id, Buffer.from(await f.arrayBuffer()), { contentType: ALLOWED[ext], upsert: false });
    if (error) throw new HttpError(502, "File storage failed: " + error.message);
    out.push({ id, name: f.name.slice(0, 120), type: ALLOWED[ext], size: f.size, uploadedAt: now() });
  }
  return out;
}

export function upsertSubmission(db: DB, orgId: string, asg: any, studentId: string, answers: any, newFiles: any[], by: string, actingStudent: boolean) {
  const subs = col(db, "submissions");
  let sub = subs.find((x) => x.assignmentId === asg.id && x.studentId === studentId && x.orgId === orgId);
  const late = asg.due && new Date(now()) > new Date(asg.due + "T23:59:59");
  if (actingStudent && late && /no late/i.test(asg.late || "")) throw new HttpError(400, "The deadline has passed and this assignment does not accept late submissions.");
  if (sub?.approved) throw new HttpError(400, "This submission has already been graded and can no longer be changed.");
  if (!sub) {
    sub = { id: uid("s_"), orgId, createdAt: now(), assignmentId: asg.id, studentId, files: [], answers: {}, grades: {}, suggestions: {}, approved: false, published: false, status: "submitted" };
    subs.push(sub);
  }
  sub.answers = { ...sub.answers, ...answers }; sub.files = [...(sub.files || []), ...newFiles];
  sub.submittedAt = now(); sub.late = !!late; sub.status = sub.status === "graded" ? "graded" : "submitted"; sub.submittedBy = by;
  return sub;
}
export { notify };
