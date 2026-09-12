import { redirect } from "next/navigation";
import { requireUser } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!user) redirect("/admin/giris");

  return <AdminShell user={user}>{children}</AdminShell>;
}
