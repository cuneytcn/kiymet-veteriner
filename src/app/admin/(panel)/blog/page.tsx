import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/admin-shell";
import { EmptyState, PublishBadge } from "@/components/admin/form-shell";
import { ButtonLink } from "@/components/ui/button";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await db.post
    .findMany({ orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }] })
    .catch(() => []);

  const draftCount = posts.filter((p) => !p.published).length;

  return (
    <>
      <PageHeader
        title="Blog"
        description={
          draftCount > 0
            ? `${posts.length} yazı · ${draftCount} taslak`
            : `${posts.length} yazı`
        }
        action={
          <ButtonLink href="/admin/blog/yeni" size="md">
            <Plus aria-hidden />
            Yeni Yazı
          </ButtonLink>
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          title="Henüz yazı yok"
          description="Düzenli blog yazısı, Google'da uzun vadeli görünürlüğün en etkili yoludur. Kedi ve köpek sahiplerinin sorduğu sorulardan başlayın."
          action={
            <ButtonLink href="/admin/blog/yeni" size="md">
              <Plus aria-hidden />
              İlk yazıyı oluştur
            </ButtonLink>
          }
        />
      ) : (
        <ul className="grid gap-2">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/admin/blog/${post.id}`}
                className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-white p-4 transition-colors hover:border-brand"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-head font-bold text-navy">
                    {post.title}
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-sm text-muted">
                    {post.excerpt}
                  </span>
                </span>

                {post.publishedAt && (
                  <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-muted">
                    <CalendarDays className="size-3.5" aria-hidden />
                    {new Intl.DateTimeFormat("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      timeZone: "UTC",
                    }).format(post.publishedAt)}
                  </span>
                )}

                <PublishBadge published={post.published} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
