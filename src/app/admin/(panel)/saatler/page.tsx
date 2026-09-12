import { PageHeader } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { HoursForm } from "./hours-form";

export const dynamic = "force-dynamic";

export default async function HoursPage() {
  const hours = await db.businessHour
    .findMany({ orderBy: { dayOfWeek: "asc" } })
    .catch(() => []);

  return (
    <>
      <PageHeader
        title="Çalışma Saatleri"
        description="Haftalık düzen. Randevu saatleri bu aralıklardan otomatik üretilir."
      />
      <HoursForm hours={hours} />
    </>
  );
}
