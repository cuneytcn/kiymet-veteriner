import { PageHeader } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { TeamManager } from "./team-manager";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const members = await db.teamMember
    .findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] })
    .catch(() => []);

  return (
    <>
      <PageHeader
        title="Ekip"
        description="Hakkımızda sayfasındaki ekip bölümü. Üye eklenmediğinde bölüm sitede görünmez."
      />
      <TeamManager members={members} />
    </>
  );
}
