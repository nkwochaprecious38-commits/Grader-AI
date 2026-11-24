import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("gai_session")?.value;
  let ok = false;
  if (token) {
    try {
      const s = process.env.SESSION_SECRET;
      // In development the secret is generated on the server; edge only checks presence there.
      if (s) { await jwtVerify(token, new TextEncoder().encode(s)); ok = true; } else ok = true;
    } catch { ok = false; }
  }
  const p = req.nextUrl.pathname;
  if (p.startsWith("/app") && !ok) {
    const u = new URL("/login", req.url); u.searchParams.set("next", p);
    const res = NextResponse.redirect(u); if (token) res.cookies.delete("gai_session"); return res;
  }
  if ((p === "/login" || p === "/signup") && ok && !req.nextUrl.searchParams.has("expired") && !req.nextUrl.searchParams.has("invite")) return NextResponse.redirect(new URL("/app", req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/app/:path*", "/login", "/signup"] };
