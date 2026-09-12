import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/admin-shell";
import { EmptyState, PublishBadge } from "@/components/admin/form-shell";
import { ButtonLink } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/icon";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await db.service
    .findMany({
      orderBy: [{ order: "asc" }, { title: "asc" }],
      include: { _count: { select: { appointments: true } } },
    })
    .catch(() => []);

  return (
    <>
      <PageHeader
        title="Hizmetler"
        description="Sitede görünen hizmetler, sayfa içerikleri ve sıralamaları."
        action={
          <ButtonLink href="/admin/hizmetler/yeni" size="md">
            <Plus aria-hidden />
            Yeni Hizmet
          </ButtonLink>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          title="Henüz hizmet yok"
          description="Kliniğinizin sunduğu hizmetleri ekleyin; ana sayfada, menüde ve randevu formunda otomatik görünürler."
          action={
            <ButtonLink href="/admin/hizmetler/yeni" size="md">
              <Plus aria-hidden />
              İlk hizmeti ekle
            </ButtonLink>
          }
        />
      ) : (
        <ul className="grid gap-2">
          {services.map((service) => (
            <li key={service.id}>
              <Link
                href={`/admin/hizmetler/${service.id}`}
                className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-white p-4 transition-colors hover:border-brand"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <ServiceIcon name={service.icon} className="size-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-head font-bold text-navy">
                    {service.title}
                  </span>
                  <span className="block truncate text-sm text-muted">
                    /hizmetler/{service.slug}
                  </span>
                </span>

                {service._count.appointments > 0 && (
                  <span className="text-sm whitespace-nowrap text-muted">
                    {service._count.appointments} randevu
                  </span>
                )}

                <span className="text-sm whitespace-nowrap text-muted">
                  Sıra: {service.order}
                </span>

                <PublishBadge published={service.published} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
