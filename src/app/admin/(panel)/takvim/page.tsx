import { PageHeader } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { ClosureManager } from "./closure-manager";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  // Geçmiş kapanışlar listeyi şişirmesin
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const closures = await db.closure
    .findMany({ where: { date: { gte: today } }, orderBy: { date: "asc" } })
    .catch(() => []);

  return (
    <>
      <PageHeader
        title="Çalışma Takvimi"
        description="Tatil, izin ve özel gün kapanışları. Bu günler randevuya kapanır."
      />
      <ClosureManager closures={closures} />
    </>
  );
}
