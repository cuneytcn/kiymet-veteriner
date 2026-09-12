import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Tag } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Prose } from "@/components/ui/prose";
import { getPostBySlug, getPosts } from "@/lib/content";
import { getSiteSettings, toTelHref } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Yazı bulunamadı" };

  return {
    title: post.seoTitle ? { absolute: post.seoTitle } : post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.seoTitle ? { absolute: post.seoTitle } : post.title,
      description: post.seoDescription || post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: (post.publishedAt ?? post.updatedAt).toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: [post.coverImage || "/og.png"],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [post, allPosts, settings] = await Promise.all([
    getPostBySlug(slug),
    getPosts(),
    getSiteSettings(),
  ]);

  if (!post) notFound();

  const related = allPosts.filter((p) => p.id !== post.id).slice(0, 3);

  const crumbs = [
    { name: "Ana Sayfa", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ];

  const published = post.publishedAt ?? post.updatedAt;

  return (
    <>
      <PageHero title={post.title} description={post.excerpt} crumbs={crumbs}>
        <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.9375rem] text-muted">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4 text-brand" aria-hidden />
            <time dateTime={published.toISOString()}>
              {new Intl.DateTimeFormat("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }).format(published)}
            </time>
          </span>

          {post.tags.length > 0 && (
            <span className="inline-flex items-center gap-2">
              <Tag className="size-4 text-brand" aria-hidden />
              {post.tags.join(", ")}
            </span>
          )}
        </p>
      </PageHero>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article>
          {post.coverImage && (
            <div className="relative mb-9 aspect-[16/9] overflow-hidden rounded-card shadow-sm">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 740px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <Prose content={post.content} />

          {/* Tıbbi içerik uyarısı — sahibi kendi başına teşhis koymasın */}
          <p className="mt-10 rounded-card border-l-4 border-sun bg-sun-soft px-6 py-5 text-[0.9375rem] leading-relaxed text-navy">
            <strong className="font-semibold">Not:</strong> Bu yazı genel
            bilgilendirme amaçlıdır ve muayenenin yerini tutmaz. Dostunuzda
            belirti gördüyseniz lütfen kliniğimizle iletişime geçin.
          </p>

          {related.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-5 text-[1.375rem]">Bunlar da ilginizi çekebilir</h2>
              <ul className="grid gap-3">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/blog/${item.slug}`}
                      className="group/rel flex items-center gap-4 rounded-card bg-white px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={item.coverImage || "/img/cat-pet.webp"}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-head font-bold text-navy transition-colors group-hover/rel:text-brand">
                          {item.title}
                        </span>
                        <span className="mt-0.5 line-clamp-1 block text-[0.875rem] text-muted">
                          {item.excerpt}
                        </span>
                      </span>
                      <ArrowRight
                        className="size-4 shrink-0 text-brand transition-transform duration-300 group-hover/rel:translate-x-1.5"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-28">
          <div className="rounded-card bg-brand px-6 py-7 text-white">
            <p className="font-head text-[1.1875rem] font-bold">
              Dostunuz için endişeli misiniz?
            </p>
            <p className="mt-2 text-[0.9375rem] opacity-95">
              Muayene randevusu oluşturun, birlikte bakalım.
            </p>
            <ButtonLink
              href="/randevu"
              variant="white"
              size="md"
              block
              className="mt-5"
            >
              Randevu Al
            </ButtonLink>
          </div>

          <div className="rounded-card bg-cream px-6 py-6">
            <p className="font-head font-bold text-navy">Acil bir durum mu?</p>
            <p className="mt-2 text-[0.9375rem] text-muted">
              Acil hattımız haftanın her günü, 24 saat açık.
            </p>
            <a
              href={toTelHref(settings.emergencyPhone)}
              className="mt-4 block font-head text-[1.0625rem] font-bold text-brand hover:underline"
            >
              {settings.emergencyPhone}
            </a>
          </div>
        </aside>
      </div>

      <ArticleJsonLd
        title={post.title}
        description={post.seoDescription || post.excerpt}
        slug={post.slug}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        image={post.coverImage}
        clinicName={settings.clinicName}
      />
      <BreadcrumbJsonLd items={crumbs} />
    </>
  );
}
