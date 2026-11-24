import { tokens } from "./ai";

/** Similar answer detection (word overlap). Groups are suggestions for review: similar wording is not evidence of misconduct. */
export function groupAnswers(items: { id: string; text: string }[], threshold = 0.5) {
  const sets = items.map((i) => new Set(tokens(i.text)));
  const parent = items.map((_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const sim = (a: Set<string>, b: Set<string>) => { if (!a.size || !b.size) return 0; let n = 0; a.forEach((x) => b.has(x) && n++); return n / (a.size + b.size - n); };
  const sims = new Map<string, number>();
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const s = sim(sets[i], sets[j]); if (s >= threshold) { parent[find(i)] = find(j); sims.set(i + "," + j, s); }
  }
  const buckets = new Map<number, number[]>();
  items.forEach((_, i) => { if (!sets[i].size) return; const r = find(i); buckets.set(r, [...(buckets.get(r) || []), i]); });
  return [...buckets.values()].map((idx, n) => {
    const freq = new Map<string, number>(); idx.forEach((i) => sets[i].forEach((w) => freq.set(w, (freq.get(w) || 0) + 1)));
    const common = [...freq].filter(([, c]) => c === idx.length).map(([w]) => w).slice(0, 8);
    const vals = [...sims].filter(([k]) => { const [a, b] = k.split(",").map(Number); return idx.includes(a) && idx.includes(b); }).map(([, v]) => v);
    return { key: "g" + n, ids: idx.map((i) => items[i].id), representative: items[idx[0]].text, commonTerms: common, avgSimilarity: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1 };
  }).sort((a, b) => b.ids.length - a.ids.length);
}
