import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Prose } from "@/components/ui/prose";
import { getPage } from "@/lib/content";
import { db } from "@/lib/db";

export const revalidate = 3600;

/**
 * Panelden oluşturulan serbest sayfalar: KVKK, gizlilik politikası,
 * kullanım şartları ve lokal SEO sayfaları burada yayınlanır.
 * Sabit route'lar (/randevu, /blog ...) Next tarafından öncelikli eşleşir.
 */
export async function generateStaticParams() {
  const pages = await db.page
    .findMany({ where: { published: true }, select: { slug: true } })
    .catch(() => []);

  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) return { title: "Sayfa bulunamadı" };

  return {
    title: page.seoTitle ? { absolute: page.seoTitle } : page.title,
    description: page.seoDescription || page.intro || undefined,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) notFound();

  const crumbs = [
    { name: "Ana Sayfa", href: "/" },
    { name: page.title, href: `/${page.slug}` },
  ];

  return (
    <>
      <PageHero
        title={page.title}
        description={page.intro ?? undefined}
        crumbs={crumbs}
      />

      <div className="container-page py-14">
        <article className="mx-auto max-w-[48rem]">
          <Prose content={page.content} />
        </article>
      </div>

      <BreadcrumbJsonLd items={crumbs} />
    </>
  );
}
