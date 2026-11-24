import { api, json } from "@/lib/http";
export const GET = api(async (_r, _c, s) => json(s));
