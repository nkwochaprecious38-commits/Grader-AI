"use client";
import { PageHead } from "@/components/ui";
import { useSession } from "@/components/Shell";
import { PasswordForm } from "@/components/PasswordForm";
export default function StudentSettings() {
  const s = useSession();
  return <><PageHead title="Settings" /><div className="grid gap-6 lg:grid-cols-2"><div className="card p-5"><h2 className="mb-3 font-bold">Profile</h2><p className="text-sm">{s.user.name}</p><p className="text-sm text-muted">{s.user.email}</p></div><div className="card p-5"><h2 className="mb-3 font-bold">Password</h2><PasswordForm /></div></div></>;
}
