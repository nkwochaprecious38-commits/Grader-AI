import { z } from "zod";
import { api, body, json } from "@/lib/http";
import { read, col } from "@/lib/store";
import { groupAnswers } from "@/lib/grouping";
import { STAFF } from "@/lib/roles";

export const POST = api(async (req, _c, s) => {
  const d = z.object({ assignmentId: z.string(), questionId: z.string(), threshold: z.number().min(0.2).max(0.95).optional() }).parse(await body(req));
  const r = await read((db) => {
    const subs = col(db, "submissions").filter((x) => x.orgId === s!.org.id && x.assignmentId === d.assignmentId);
    const names = new Map(col(db, "students").map((x) => [x.id, x.name]));
    const items = subs.map((x) => ({ id: x.id, text: String(x.answers?.[d.questionId] || "") }));
    return groupAnswers(items, d.threshold ?? 0.5).map((g) => ({ ...g, members: g.ids.map((id) => ({ id, student: names.get(subs.find((x) => x.id === id)!.studentId) || "Student", text: items.find((i) => i.id === id)!.text })) }));
  });
  return json({ groups: r, notice: "Groups are based on similar wording only. They are not evidence of plagiarism or misconduct." });
}, { roles: STAFF });
