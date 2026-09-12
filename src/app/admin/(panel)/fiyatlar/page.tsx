import { PageHeader } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { PriceManager } from "./price-manager";

export const dynamic = "force-dynamic";

export default async function AdminPricesPage() {
  const categories = await db.priceCategory
    .findMany({
      orderBy: { order: "asc" },
      include: { items: { orderBy: { order: "asc" } } },
    })
    .catch(() => []);

  return (
    <>
      <PageHeader
        title="Fiyat Listesi"
        description="Fiyatlandırma sayfasında ve ana sayfada görünen ücretler. Değişiklik anında yayına girer."
      />
      <PriceManager categories={categories} />
    </>
  );
}
