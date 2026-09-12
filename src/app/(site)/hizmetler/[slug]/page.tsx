import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd, ServiceJsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Prose } from "@/components/ui/prose";
import { ServiceIcon } from "@/components/ui/icon";
import { getServiceBySlug, getServices } from "@/lib/content";
import { getSiteSettings, toTelHref } from "@/lib/site";

export const revalidate = 3600;

/** Hizmetin kendi görseli yoksa slug'a göre stok görsel. */
const FALLBACK_IMAGES: Record<string, string> = {
  "genel-muayene": "/img/vet-hand-kitten.webp",
  "asi-saglik": "/img/cat-gray.webp",
  cerrahi: "/img/dog-outdoors.webp",
  laboratuvar: "/img/dog-puppy.webp",
  acil: "/img/hero-dog.webp",
  "dis-bakimi": "/img/cat-pet.webp",
};

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) return { title: "Hizmet bulunamadı" };

  return {
    // Panelden gelen başlık markayı zaten içeriyorsa şablon tekrar eklemesin
    title: service.seoTitle ? { absolute: service.seoTitle } : service.title,
    description: service.seoDescription || service.shortDescription,
    alternates: { canonical: `/hizmetler/${service.slug}` },
    openGraph: {
      title: service.seoTitle || service.title,
      description: service.seoDescription || service.shortDescription,
      url: `/hizmetler/${service.slug}`,
      type: "article",
      images: [service.coverImage || "/og.png"],
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [service, allServices, settings] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
    getSiteSettings(),
  ]);

  if (!service) notFound();

  const others = allServices.filter((s) => s.id !== service.id).slice(0, 4);
  const image =
    service.coverImage ||
    FALLBACK_IMAGES[service.slug] ||
    "/img/vet-kitten.webp";

  const crumbs = [
    { name: "Ana Sayfa", href: "/" },
    { name: "Hizmetler", href: "/hizmetler" },
    { name: service.title, href: `/hizmetler/${service.slug}` },
  ];

  return (
    <>
      <PageHero
        title={service.title}
        description={service.shortDescription}
        crumbs={crumbs}
      >
        <span className="mt-7 grid size-16 place-items-center rounded-full bg-brand text-white shadow-md">
          <ServiceIcon name={service.icon} className="size-7" />
        </span>
      </PageHero>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article>
          <div className="relative mb-9 aspect-[16/9] overflow-hidden rounded-card shadow-sm">
            <Image
              src={image}
              alt={service.title}
              fill
              sizes="(max-width: 1024px) 100vw, 740px"
              className="object-cover"
              priority
            />
          </div>

          {service.content ? (
            <Prose content={service.content} />
          ) : (
            <p className="text-[1.0625rem] text-muted">
              {service.shortDescription}
            </p>
          )}

          {service.highlights.length > 0 && (
            <section className="mt-10 rounded-card bg-cream px-7 py-7">
              <h2 className="text-[1.1875rem]">Bu hizmet kapsamında</h2>
              <ul className="mt-5 grid gap-3.5 sm:grid-cols-2">
                {service.highlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-leaf text-white">
                      <Check className="size-3" aria-hidden />
                    </span>
                    <span className="text-[0.96875rem] leading-relaxed text-navy">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {others.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-5 text-[1.375rem]">Diğer hizmetlerimiz</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {others.map((other) => (
                  <li key={other.id}>
                    <Link
                      href={`/hizmetler/${other.slug}`}
                      className="group/o flex h-full items-center gap-4 rounded-card bg-white px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition-colors duration-300 group-hover/o:bg-brand group-hover/o:text-white">
                        <ServiceIcon name={other.icon} className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-head font-bold text-navy transition-colors group-hover/o:text-brand">
                          {other.title}
                        </span>
                        <span className="mt-0.5 line-clamp-1 block text-[0.875rem] text-muted">
                          {other.shortDescription}
                        </span>
                      </span>
                      <ArrowRight
                        className="size-4 shrink-0 text-brand transition-transform duration-300 group-hover/o:translate-x-1.5"
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
              {service.title} için randevu
            </p>
            <p className="mt-2 text-[0.9375rem] opacity-95">
              Müsait saatleri görün, size uygun olanı seçin.
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
            <p className="font-head font-bold text-navy">Sorunuz mu var?</p>
            <p className="mt-2 text-[0.9375rem] text-muted">
              Klinik saatlerinde bizi arayabilirsiniz.
            </p>
            <a
              href={toTelHref(settings.phone)}
              className="mt-4 flex items-center justify-center gap-2 rounded-pill border-2 border-line bg-white py-3 font-head font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
            >
              <Phone className="size-4" aria-hidden />
              {settings.phone}
            </a>
          </div>

          <div className="rounded-card bg-danger-soft px-6 py-6">
            <p className="font-head font-bold text-danger">Acil durum mu?</p>
            <p className="mt-2 text-[0.9375rem] text-navy">
              Acil hattımız 7 gün 24 saat açık.
            </p>
            <a
              href={toTelHref(settings.emergencyPhone)}
              className="mt-3 block font-head text-[1.0625rem] font-bold text-danger hover:underline"
            >
              {settings.emergencyPhone}
            </a>
          </div>
        </aside>
      </div>

      <ServiceJsonLd
        name={service.title}
        description={service.seoDescription || service.shortDescription}
        slug={service.slug}
      />
      <BreadcrumbJsonLd items={crumbs} />
    </>
  );
}
