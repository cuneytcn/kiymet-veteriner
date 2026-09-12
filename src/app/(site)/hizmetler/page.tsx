import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { ServiceCard } from "@/components/services/service-card";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { getServices } from "@/lib/content";
import { getSiteSettings } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: "Hizmetlerimiz",
    description: `${s.district} ${s.clinicName} hizmetleri: genel muayene, aşı, cerrahi, laboratuvar, acil müdahale ve diş bakımı.`,
    alternates: { canonical: "/hizmetler" },
  };
}

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    getServices(),
    getSiteSettings(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Hizmetlerimiz"
        title="Dostunuzun her ihtiyacına tek çatı altında cevap"
        description={`${settings.district}'daki kliniğimizde rutin kontrolden ileri cerrahiye kadar geniş bir hizmet yelpazesi sunuyoruz.`}
        crumbs={[
          { name: "Ana Sayfa", href: "/" },
          { name: "Hizmetler", href: "/hizmetler" },
        ]}
      />

      <div className="container-page py-16">
        {services.length === 0 ? (
          <p className="rounded-card border border-dashed border-line p-10 text-center text-muted">
            Hizmetler yakında eklenecek.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        )}

        <div className="mt-14 rounded-card bg-brand px-8 py-12 text-center text-white md:px-12">
          <h2 className="text-[1.75rem] text-white md:text-[2.25rem]">
            Hangi hizmete ihtiyacınız olduğundan emin değil misiniz?
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-95">
            Randevu oluşturun, muayenede dostunuz için en doğru yolu birlikte
            belirleyelim.
          </p>
          <div className="mt-7">
            <ButtonLink href="/randevu" variant="white" size="lg">
              Randevu Al
            </ButtonLink>
          </div>
        </div>
      </div>

      <BreadcrumbJsonLd
        items={[
          { name: "Ana Sayfa", href: "/" },
          { name: "Hizmetler", href: "/hizmetler" },
        ]}
      />
    </>
  );
}
