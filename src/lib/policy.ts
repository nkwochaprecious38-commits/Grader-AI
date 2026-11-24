import { HttpError } from "./http";
import { COLLECTIONS } from "./roles";

export function policy(name: string) { const p = COLLECTIONS[name]; if (!p) throw new HttpError(404, "Unknown collection."); return p; }
export const clean = (b: any) => {
  if (!b || typeof b !== "object" || Array.isArray(b)) throw new HttpError(400, "Invalid payload.");
  const { id, orgId, createdAt, demo, ...rest } = b;
  if (JSON.stringify(rest).length > 400_000) throw new HttpError(413, "Payload too large.");
  return rest;
};

