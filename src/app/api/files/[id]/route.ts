import { api, HttpError } from "@/lib/http";
import { read, col } from "@/lib/store";
import { admin, BUCKET } from "@/lib/supa";

export const GET = api(async (_r, { params }, s) => {
  const id = (await params).id;
  const f = await read((db) => {
    for (const sub of col(db, "submissions")) {
      if (sub.orgId !== s!.org.id) continue;
      const file = (sub.files || []).find((x: any) => x.id === id);
      if (!file) continue;
      if (s!.role === "student" && sub.studentId !== s!.studentId) return null;
      return file;
    }
    return null;
  });
  if (!f) throw new HttpError(404, "File not found.");
  const dl = await admin().storage.from(BUCKET).download(f.id);
  if (dl.error || !dl.data) throw new HttpError(404, "File not found.");
  const buf = Buffer.from(await dl.data.arrayBuffer());
  return new Response(buf, { headers: { "Content-Type": f.type || "application/octet-stream", "Content-Disposition": `inline; filename="${encodeURIComponent(f.name)}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox" } });
});
