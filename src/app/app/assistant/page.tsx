"use client";
import { useRef, useState } from "react";
import { Send, Bot, Eye, Lightbulb } from "lucide-react";
import { PageHead, call } from "@/components/ui";

const PROMPTS = ["Summarize the class performance for this examination.", "Which questions had the lowest average scores?", "Identify common mistakes in these submissions.", "Show all submissions awaiting grading.", "Identify answers that require manual review.", "Compare the performance of two assignments.", "Summarize student performance across the course.", "Draft feedback for Amara."];
export default function Assistant() {
  const [msgs, setMsgs] = useState<any[]>([]); const [q, setQ] = useState(""); const [busy, setBusy] = useState(false); const end = useRef<HTMLDivElement>(null);
  async function ask(text: string) {
    if (!text.trim() || busy) return; setMsgs((m) => [...m, { role: "user", text }]); setQ(""); setBusy(true);
    try { const r = await call("/api/ai/assistant", { body: { q: text } }); setMsgs((m) => [...m, { role: "ai", ...r }]); } catch (e: any) { setMsgs((m) => [...m, { role: "err", text: e.message }]); } finally { setBusy(false); setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth" }), 50); }
  }
  return <>
    <PageHead title="AI Assistant" sub="Answers come from your workspace records. Observed results are shown separately from suggestions. Grading decisions stay with you." />
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card flex min-h-[460px] flex-col lg:col-span-2">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {!msgs.length && <div className="py-10 text-center text-sm text-muted"><Bot className="mx-auto mb-2 h-8 w-8 text-teal" />Ask about your assessments, or pick an example.</div>}
          {msgs.map((m, i) => m.role === "user" ? <div key={i} className="ml-auto max-w-[85%] rounded-xl bg-teal px-4 py-2.5 text-sm text-white">{m.text}</div> : m.role === "err" ? <p key={i} className="text-sm text-bad">{m.text}</p> :
            <div key={i} className="max-w-[92%] space-y-3 rounded-xl bg-soft p-4 text-sm">
              <div><p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal-deep"><Eye className="h-3.5 w-3.5" />Observed in your records</p><ul className="space-y-1">{m.observed.map((o: string, j: number) => <li key={j}>{o}</li>)}</ul></div>
              {m.suggestions?.length > 0 && <div className="rounded-lg border border-warn/40 bg-[#FCF1DC]/60 p-3"><p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#8A5A0B]"><Lightbulb className="h-3.5 w-3.5" />AI suggestion: review before use</p><ul className="space-y-1">{m.suggestions.map((o: string, j: number) => <li key={j}>{o}</li>)}</ul></div>}
              {m.note && <p className="text-xs text-muted">{m.note}</p>}</div>)}
          {busy && <p className="text-sm text-muted">Reading your records</p>}<div ref={end} /></div>
        <form className="flex gap-2 border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); ask(q); }}><input className="input" aria-label="Ask the assistant" placeholder="Ask a question about your assessments" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn-primary" disabled={busy || !q.trim()} aria-label="Send"><Send className="h-4 w-4" /></button></form></div>
      <div className="card h-fit p-5"><h2 className="font-bold">Example requests</h2><div className="mt-3 space-y-2">{PROMPTS.map((p) => <button key={p} onClick={() => ask(p)} className="w-full rounded-lg border border-line p-2.5 text-left text-sm hover:border-wint hover:bg-mint-pale">{p}</button>)}</div>
        <p className="mt-4 text-xs text-muted">Name an assignment in your question to focus on it. The assistant never invents marks or records: if data is missing it says so.</p></div></div>
  </>;
}
