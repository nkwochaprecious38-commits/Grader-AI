import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSession, type Session } from "./auth";
import type { Role } from "./roles";

export class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }
export const json = (d: any, status = 200) => NextResponse.json(d, { status });

export function api(handler: (req: Request, ctx: any, s: Session | null) => Promise<Response>, opts: { auth?: boolean; roles?: Role[] } = { auth: true }) {
  return async (req: Request, ctx: any) => {
    try {
      const s = await getSession();
      if (opts.auth !== false && !s) throw new HttpError(401, "Please log in to continue.");
      if (opts.roles && s && !opts.roles.includes(s.role)) throw new HttpError(403, "Your role does not have access to this action.");
      return await handler(req, ctx, s);
    } catch (e: any) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      if (e instanceof ZodError) return json({ error: e.issues[0]?.message || "Invalid input.", field: e.issues[0]?.path?.[0] }, 400);
      console.error(e);
      // Temporary troubleshooting aid: set DEBUG_ERRORS=true to show the technical reason (keys are masked). Remove it afterwards.
      const detail = process.env.DEBUG_ERRORS === "true" ? ` [${String(e?.message || e).replace(/eyJ[\w.-]+|sb_[\w-]+/g, "[key]").slice(0, 200)}]` : "";
      return json({ error: "Something went wrong on our side. Please try again." + detail }, 500);
    }
  };
}
export async function body<T = any>(req: Request): Promise<T> {
  try { return await req.json(); } catch { throw new HttpError(400, "Invalid request body."); }
}
