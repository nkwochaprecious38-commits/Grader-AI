import { z } from "zod";
import { api, body, json, HttpError } from "@/lib/http";
import { tx, col, now, audit } from "@/lib/store";
import { ADMINS } from "@/lib/roles";

/** Only checks that the configured platform URL is reachable. An integration is never reported as active from this test alone. */
export const POST = api(async (req, _c, s) => {
  const { id } = z.object({ id: z.string() }).parse(await body(req));
  const rec = await tx((db) => col(db, "integrations").find((x) => x.id === id && x.orgId === s!.org.id), false);
  if (!rec?.baseUrl) throw new HttpError(400, "Save a platform URL first.");
  let url: URL; try { url = new URL(rec.baseUrl); if (url.protocol !== "https:") throw 0; } catch { throw new HttpError(400, "The platform URL must be a valid https address."); }
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[)/.test(url.hostname)) throw new HttpError(400, "Private network addresses are not allowed.");
  let reachable = false, detail = "";
  try { const r = await fetch(url, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(6000) }); reachable = r.status < 500; detail = `Platform responded with HTTP ${r.status}.`; } catch (e: any) { detail = "The platform could not be reached: " + (e?.cause?.code || e?.message || "network error"); }
  await tx((db) => {
    const r = col(db, "integrations").find((x) => x.id === id)!;
    r.lastTest = { at: now(), reachable, detail }; r.status = reachable ? "reachable" : "failed";
    audit(db, s!.org.id, s!.user, "integration.tested", { id, reachable });
  });
  return json({ reachable, detail });
}, { roles: ADMINS });
