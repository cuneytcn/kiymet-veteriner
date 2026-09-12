import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { ServiceForm } from "../service-form";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await db.service.findUnique({ where: { id } }).catch(() => null);

  if (!service) notFound();

  return (
    <>
      <PageHeader
        title={service.title}
        description="Hizmet sayfasının içeriğini ve SEO bilgilerini düzenleyin."
        backHref="/admin/hizmetler"
      />
      <ServiceForm service={service} />
    </>
  );
}
