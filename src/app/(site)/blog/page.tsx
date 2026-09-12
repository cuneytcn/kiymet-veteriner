import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { getPosts } from "@/lib/content";
import { getSiteSettings } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: "Blog — Evcil Hayvan Sağlığı Rehberi",
    description: `${s.clinicName} veteriner hekimlerinden kedi ve köpek sağlığı, aşı, beslenme ve bakım üzerine yazılar.`,
    alternates: { canonical: "/blog" },
  };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function BlogPage() {
  const posts = await getPosts();

  const crumbs = [
    { name: "Ana Sayfa", href: "/" },
    { name: "Blog", href: "/blog" },
  ];

  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Evcil hayvan sağlığı rehberi"
        description="Veteriner hekimlerimizin kaleminden aşı, beslenme, bakım ve hastalık belirtileri üzerine yazılar."
        crumbs={crumbs}
      />

      <Section>
        <div className="container-page">
          {posts.length === 0 ? (
            <div className="rounded-card border border-dashed border-line bg-cream px-8 py-16 text-center">
              <h2 className="text-[1.375rem]">Yazılar hazırlanıyor</h2>
              <p className="mx-auto mt-3 max-w-md text-muted">
                Kedi ve köpek sağlığı üzerine rehber yazılarımız çok yakında
                burada olacak. O zamana kadar aklınıza takılanı bize
                sorabilirsiniz.
              </p>
              <div className="mt-7">
                <ButtonLink href="/iletisim" size="lg">
                  Bize Ulaşın
                </ButtonLink>
              </div>
            </div>
          ) : (
            <>
              {/* Öne çıkan yazı */}
              {featured && (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group/feat reveal grid overflow-hidden rounded-card bg-white shadow-sm transition-all duration-300 hover:shadow-md lg:grid-cols-2"
                >
                  <span className="relative block aspect-[16/10] overflow-hidden lg:aspect-auto">
                    <Image
                      src={featured.coverImage || "/img/dog-outdoors.webp"}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 560px"
                      className="object-cover transition-transform duration-600 group-hover/feat:scale-105"
                    />
                  </span>

                  <span className="flex flex-col justify-center px-7 py-8 md:px-10">
                    <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-brand-soft px-3.5 py-1.5 font-head text-[0.8125rem] font-semibold text-brand">
                      Öne çıkan
                    </span>

                    <h2 className="mt-4 text-[1.5rem] transition-colors group-hover/feat:text-brand md:text-[1.875rem]">
                      {featured.title}
                    </h2>

                    <span className="mt-3 block text-[1.0625rem] text-muted">
                      {featured.excerpt}
                    </span>

                    <span className="mt-5 flex items-center gap-4 text-[0.875rem] text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-4" aria-hidden />
                        {formatDate(featured.publishedAt ?? featured.updatedAt)}
                      </span>
                    </span>

                    <span className="mt-5 inline-flex items-center gap-2 font-head font-semibold text-brand">
                      Yazıyı oku
                      <ArrowRight
                        className="size-4 transition-transform duration-300 group-hover/feat:translate-x-1.5"
                        aria-hidden
                      />
                    </span>
                  </span>
                </Link>
              )}

              {/* Diğer yazılar */}
              {rest.length > 0 && (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group/post reveal flex flex-col overflow-hidden rounded-card bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-md"
                    >
                      <span className="relative block aspect-[16/10] overflow-hidden">
                        <Image
                          src={post.coverImage || "/img/cat-gray.webp"}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 92vw, 360px"
                          className="object-cover transition-transform duration-600 group-hover/post:scale-108"
                        />
                      </span>

                      <span className="flex flex-1 flex-col px-6 py-6">
                        <span className="text-[0.8125rem] text-muted">
                          {formatDate(post.publishedAt ?? post.updatedAt)}
                        </span>

                        <h2 className="mt-2 text-[1.15625rem] transition-colors group-hover/post:text-brand">
                          {post.title}
                        </h2>

                        <span className="mt-2 flex-1 text-[0.9375rem] text-muted">
                          {post.excerpt}
                        </span>

                        <span className="mt-4 inline-flex items-center gap-1.5 font-head text-[0.90625rem] font-semibold text-navy transition-colors group-hover/post:text-brand">
                          Devamını oku
                          <ArrowRight
                            className="size-4 transition-transform duration-300 group-hover/post:translate-x-1.5"
                            aria-hidden
                          />
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Section>

      <BreadcrumbJsonLd items={crumbs} />
    </>
  );
}
