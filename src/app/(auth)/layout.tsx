import Link from "next/link";
import { Brand } from "@/components/Nav";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-screen lg:grid-cols-2">
    <div className="flex flex-col px-5 py-6 sm:px-10">
      <Brand />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      <p className="text-center text-sm text-muted">© 2026 Grader AI</p>
    </div>
    <aside className="relative hidden bg-teal-deep p-12 text-white lg:flex lg:flex-col lg:justify-center">
      <h2 className="font-head text-3xl font-extrabold leading-tight text-white">Spend Less Time Grading. More Time Teaching.</h2>
      <p className="mt-4 max-w-md text-white/80">Create assessments, review AI suggested marks against your rubric, and publish feedback when you are ready.</p>
      <ul className="mt-8 space-y-3 text-sm text-white/90">{["Instructors approve every grade before it is published", "Each organization's records stay separate", "Students only see their own published results"].map((t) => <li key={t} className="flex gap-3"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-wint" />{t}</li>)}</ul>
    </aside>
  </div>;
}
