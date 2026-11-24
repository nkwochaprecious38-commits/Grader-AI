import { api, json } from "@/lib/http";
import { read } from "@/lib/store";
import { STAFF } from "@/lib/roles";
export const GET = api(async (_r, _c, s) => json(await read((db) => db.memberships.filter((m) => m.orgId === s!.org.id && STAFF.includes(m.role) && !m.disabled).map((m) => ({ id: m.userId, name: db.users.find((u) => u.id === m.userId)?.name })))), { roles: STAFF });
