import type { Metadata } from "next";
import { Info, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { getPriceCategories } from "@/lib/content";
import { getSiteSettings, toTelHref } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: "Fiyat Listesi",
    description: `${s.district} ${s.clinicName} güncel fiyat listesi: muayene, aşı, kısırlaştırma, laboratuvar ve görüntüleme ücretleri.`,
    alternates: { canonical: "/fiyatlandirma" },
  };
}

/** Kategori başlıklarına sırayla dönen renk tonları. */
const TONES = [
  "bg-brand-soft text-brand",
  "bg-leaf-soft text-leaf-dark",
  "bg-sun-soft text-sun-dark",
  "bg-navy-soft text-navy",
];

export default async function PricingPage() {
  const [categories, settings] = await Promise.all([
    getPriceCategories(),
    getSiteSettings(),
  ]);

  const crumbs = [
    { name: "Ana Sayfa", href: "/" },
    { name: "Fiyatlandırma", href: "/fiyatlandirma" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Şeffaf fiyatlandırma"
        title="Güncel fiyat listemiz"
        description="Ücretlerimizi önceden bilin, sürprizle karşılaşmayın. Listede olmayan işlemler için bizi arayabilirsiniz."
        crumbs={crumbs}
      />

      <Section>
        <div className="container-page">
          <p className="mb-9 flex items-start gap-3.5 rounded-card border-l-4 border-sun bg-sun-soft px-6 py-5 text-[0.96875rem] leading-relaxed text-navy">
            <Info className="mt-0.5 size-5 shrink-0 text-sun-dark" aria-hidden />
            <span>
              Fiyatlar bilgilendirme amaçlıdır ve hastanın kilosu, yaşı ile
              işlemin kapsamına göre değişebilir. Kesin ücret muayene sonrasında
              netleşir. Cerrahi işlemlerde anestezi ve ilaç ücretleri dahildir.
            </span>
          </p>

          {categories.length === 0 ? (
            <p className="rounded-card border border-dashed border-line bg-cream p-12 text-center text-muted">
              Fiyat listesi yakında yayınlanacak. Bilgi için bizi arayın.
            </p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {categories.map((category, index) => (
                <section
                  key={category.id}
                  className="reveal overflow-hidden rounded-card bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
                >
                  <div
                    className={`flex items-center justify-between gap-4 px-6 py-5 ${TONES[index % TONES.length]}`}
                  >
                    <div>
                      <h2 className="text-[1.1875rem] text-current">
                        {category.title}
                      </h2>
                      {category.note && (
                        <p className="mt-0.5 text-[0.875rem] opacity-80">
                          {category.note}
                        </p>
                      )}
                    </div>
                    <span className="font-head text-[0.8125rem] font-semibold whitespace-nowrap opacity-70">
                      {category.items.length} işlem
                    </span>
                  </div>

                  <ul className="px-6 py-2">
                    {category.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed border-line py-3.5 last:border-0"
                      >
                        <span className="text-[0.96875rem] text-navy">
                          {item.name}
                          {item.note && (
                            <span className="block text-[0.8125rem] text-muted">
                              {item.note}
                            </span>
                          )}
                        </span>
                        <span className="font-head font-bold whitespace-nowrap text-brand tabular-nums">
                          {item.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {/* Alt CTA */}
          <div className="mt-14 grid gap-7 rounded-card bg-navy-deep px-8 py-10 text-white md:grid-cols-2 md:items-center md:px-12">
            <div>
              <h2 className="text-[1.5rem] text-white md:text-[1.875rem]">
                Listede olmayan bir işlem mi arıyorsunuz?
              </h2>
              <p className="mt-3 text-muted-light">
                Bizi arayın, dostunuzun durumuna özel bilgi verelim.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 sm:flex-row md:justify-end">
              <ButtonAnchor
                href={toTelHref(settings.phone)}
                variant="white"
                size="lg"
              >
                <Phone aria-hidden />
                {settings.phone}
              </ButtonAnchor>
              <ButtonLink href="/randevu" size="lg">
                Randevu Al
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <BreadcrumbJsonLd items={crumbs} />
    </>
  );
}
