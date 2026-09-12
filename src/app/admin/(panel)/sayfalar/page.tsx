import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/admin-shell";
import { EmptyState, PublishBadge } from "@/components/admin/form-shell";
import { ButtonLink } from "@/components/ui/button";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await db.page
    .findMany({ orderBy: { title: "asc" } })
    .catch(() => []);

  return (
    <>
      <PageHeader
        title="Sayfalar"
        description="Hakkımızda, KVKK, gizlilik politikası gibi serbest sayfalar."
        action={
          <ButtonLink href="/admin/sayfalar/yeni" size="md">
            <Plus aria-hidden />
            Yeni Sayfa
          </ButtonLink>
        }
      />

      {pages.length === 0 ? (
        <EmptyState
          title="Henüz sayfa yok"
          description="Yasal metinler ve serbest içerik sayfaları buradan yönetilir."
          action={
            <ButtonLink href="/admin/sayfalar/yeni" size="md">
              <Plus aria-hidden />
              İlk sayfayı oluştur
            </ButtonLink>
          }
        />
      ) : (
        <ul className="grid gap-2">
          {pages.map((page) => (
            <li key={page.id}>
              <Link
                href={`/admin/sayfalar/${page.id}`}
                className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-white p-4 transition-colors hover:border-brand"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-head font-bold text-navy">
                    {page.title}
                  </span>
                  <span className="block truncate text-sm text-muted">
                    /{page.slug}
                  </span>
                </span>

                <PublishBadge published={page.published} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
