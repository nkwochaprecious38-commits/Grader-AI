import { z } from "zod";
import { api, body, json } from "@/lib/http";
import { read } from "@/lib/store";
import { ask } from "@/lib/assistant";
import { STAFF } from "@/lib/roles";

export const POST = api(async (req, _c, s) => {
  const { q } = z.object({ q: z.string().trim().min(2, "Type a question.").max(500) }).parse(await body(req));
  return json(await read((db) => ask(db, s!.org.id, q)));
}, { roles: STAFF });
