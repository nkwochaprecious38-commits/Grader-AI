import { z } from "zod";
import { api, body, json, HttpError } from "@/lib/http";
import { tx, col, uid, now, audit, notify } from "@/lib/store";

export const POST = api(async (req, _c, s) => {
  const d = z.object({ submissionId: z.string(), questionId: z.string().optional(), type: z.enum(["regrade", "clarification"]), reason: z.string().trim().min(10, "Please explain your concern in at least 10 characters.").max(3000) }).parse(await body(req));
  const r = await tx((db) => {
    const sub = col(db, "submissions").find((x) => x.id === d.submissionId && x.orgId === s!.org.id && x.studentId === s!.studentId);
    if (!sub || !sub.published) throw new HttpError(404, "Only published results can be queried.");
    if (col(db, "regrades").some((x) => x.submissionId === sub.id && x.questionId === d.questionId && x.status === "open")) throw new HttpError(409, "You already have an open request for this item.");
    const asg = col(db, "assignments").find((a) => a.id === sub.assignmentId);
    const rec = { id: uid("r_"), orgId: s!.org.id, createdAt: now(), submissionId: sub.id, assignmentId: sub.assignmentId, studentId: sub.studentId, studentName: s!.user.name, assignmentTitle: asg?.title, questionId: d.questionId, type: d.type, reason: d.reason, status: "open", history: [{ at: now(), by: s!.user.name, action: "Request submitted" }] };
    col(db, "regrades").push(rec);
    notify(db, s!.org.id, null, "New regrade request", `${s!.user.name}: ${asg?.title}`);
    audit(db, s!.org.id, s!.user, "regrade.requested", { id: rec.id });
    return rec;
  });
  return json(r, 201);
}, { roles: ["student"] });
