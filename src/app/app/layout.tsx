import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Shell from "@/components/Shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Workspace", robots: { index: false } };
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/login?expired=1");
  return <Shell session={s}>{children}</Shell>;
}
