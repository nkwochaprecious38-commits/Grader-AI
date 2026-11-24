import { api, json } from "@/lib/http";
import { read } from "@/lib/store";
import { analytics } from "@/lib/analytics";
import { STAFF } from "@/lib/roles";
export const GET = api(async (_r, _c, s) => json(await read((db) => analytics(db, s!.org.id))), { roles: STAFF });
