import { PageHeader } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { FaqManager } from "./faq-manager";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const faqs = await db.faq
    .findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] })
    .catch(() => []);

  return (
    <>
      <PageHeader
        title="Sık Sorulan Sorular"
        description="Ana sayfada ve randevu sayfasında görünen sorular. Google'da zengin sonuç olarak da çıkabilirler."
      />
      <FaqManager faqs={faqs} />
    </>
  );
}
