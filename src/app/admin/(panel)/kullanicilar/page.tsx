import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/auth";
import { db } from "@/lib/db";
import { UserManager } from "./user-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // Editörler bu ekranı göremez, panele geri gönderilirler.
  const admin = await requireAdmin();
  if (!admin) redirect("/admin");

  const users = await db.user
    .findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    })
    .catch(() => []);

  return (
    <>
      <PageHeader
        title="Kullanıcılar"
        description="Panele giriş yapabilecek kişiler ve yetkileri."
      />
      <UserManager users={users} currentUserId={admin.id} />
    </>
  );
}
