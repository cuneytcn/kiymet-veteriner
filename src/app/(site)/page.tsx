import type { Metadata } from "next";
import { CalendarCheck, Phone } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { About } from "@/components/home/about";
import { HoursBlock } from "@/components/home/hours-block";
import { ServiceCard } from "@/components/services/service-card";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { Section, SectionHeading, Eyebrow } from "@/components/ui/section";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { getFaqs, getPriceCategories, getServices } from "@/lib/content";
import { getSiteSettings, toTelHref } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    // Ayarlardaki başlık markayı içeriyor; şablon tekrar eklemesin
    title: { absolute: s.seoTitle || s.clinicName },
    description: s.seoDescription || s.description,
    alternates: { canonical: "/" },
  };
}

/** Sayılar panelden (Site Ayarları → İstatistikler) yönetilir. */
const buildStats = (s: {
  yearsOfExperience: number;
  patientCount: string;
  specialtyCount: number;
}) => [
  { value: `${s.yearsOfExperience}+`, label: "yıllık deneyim", color: "text-brand" },
  { value: s.patientCount, label: "mutlu hasta", color: "text-leaf" },
  { value: "7/24", label: "acil hizmet", color: "text-sun" },
  { value: String(s.specialtyCount), label: "uzmanlık alanı", color: "text-navy" },
];

export default async function HomePage() {
  const [services, faqs, settings, priceCategories] = await Promise.all([
    getServices(),
    getFaqs("genel"),
    getSiteSettings(),
    getPriceCategories(),
  ]);

  // Ana sayfada fiyat listesinin ilk üç kategorisi, her birinden dört kalem
  const priceTeaser = priceCategories.slice(0, 3).map((category) => ({
    ...category,
    items: category.items.slice(0, 4),
  }));

  return (
    <>
      <Hero />
      <About />

      {/* Hizmetler */}
      <Section tone="cream" id="hizmetler">
        <div className="container-page">
          <SectionHeading
            eyebrow="Hizmetlerimiz"
            title="Dostunuzun ihtiyaç duyduğu her şey"
            description="Rutin kontrolden ileri cerrahiye kadar, modern ekipman ve deneyimli ekiple."
          />

          {services.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          ) : (
            <p className="mt-12 rounded-card border border-dashed border-line bg-white p-10 text-center text-muted">
              Hizmetler yakında eklenecek.
            </p>
          )}
        </div>
      </Section>

      <HoursBlock />

      {/* Sayaçlar */}
      <Section className="py-15 md:py-15">
        <div className="container-page grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {buildStats(settings).map((s) => (
            <div key={s.label} className="reveal">
              <span
                className={`block font-head text-[2.25rem] leading-none font-bold md:text-5xl ${s.color}`}
              >
                {s.value}
              </span>
              <span className="mt-2 block text-[0.9375rem] text-muted">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Randevu bandı */}
      <section className="relative overflow-hidden bg-brand py-[4.625rem] text-white md:py-section">
        <span
          className="pointer-events-none absolute -top-30 -left-30 size-[23.75rem] rounded-full bg-white/10"
          aria-hidden
        />

        <div className="container-page relative grid items-center gap-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-13">
          <div className="reveal">
            <Eyebrow label="Online randevu" tone="dark" />

            <h2 className="mt-3.5 text-[1.75rem] text-white md:text-[2.5rem]">
              Müsait saatleri görün,
              <br />
              dakikalar içinde seçin
            </h2>

            <p className="mt-4 max-w-[32em] text-[1.0625rem] opacity-95">
              Hangi günün hangi saati boş, sayfayı açtığınız anda görünüyor.
              Talebiniz bize ulaştığında sizi arayıp teyit ediyoruz.
            </p>

            <div className="mt-7 flex flex-wrap gap-3.5">
              <ButtonLink href="/randevu" variant="white" size="lg">
                <CalendarCheck aria-hidden />
                Randevu Formuna Git
              </ButtonLink>
              <ButtonAnchor
                href={toTelHref(settings.phone)}
                variant="navy"
                size="lg"
              >
                <Phone aria-hidden />
                {settings.phone}
              </ButtonAnchor>
            </div>
          </div>

          <ul className="reveal grid gap-3 rounded-card bg-white p-7 text-navy shadow-lg">
            <li className="font-head text-[1.1875rem] font-bold">
              Randevu üç adımda hazır
            </li>
            {[
              "Dostunuzun bilgilerini ve size uyan saati seçin.",
              "Ekibimiz talebinizi görür ve telefonla teyit eder.",
              "Randevu saatinizde bekleme olmadan muayeneye başlarız.",
            ].map((text, i) => (
              <li key={text} className="flex gap-3.5 border-t border-line pt-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft font-head text-sm font-bold text-brand">
                  {i + 1}
                </span>
                <span className="text-[0.96875rem] text-muted">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fiyatlar */}
      {priceTeaser.length > 0 && (
        <Section tone="cream" id="fiyatlar">
          <div className="container-page">
            <SectionHeading
              eyebrow="Şeffaf fiyatlandırma"
              title="Ücretlerimizi önceden bilin"
              description="Sık sorulan işlemlerin güncel ücretleri. Tam liste fiyatlandırma sayfasında."
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {priceTeaser.map((category) => (
                <div
                  key={category.id}
                  className="reveal rounded-card bg-white px-6 py-[1.875rem] shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-md"
                >
                  <h3 className="border-b border-dashed border-line pb-[1.125rem] text-[1.1875rem]">
                    {category.title}
                  </h3>

                  <ul className="mt-4">
                    {category.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-baseline justify-between gap-3.5 py-[0.5625rem] text-[0.96875rem]"
                      >
                        <span>{item.name}</span>
                        <span className="font-head font-bold whitespace-nowrap text-brand">
                          {item.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-9 text-center">
              <ButtonLink href="/fiyatlandirma" variant="navy" size="lg">
                Tüm Fiyat Listesi
              </ButtonLink>
            </p>
          </div>
        </Section>
      )}

      {/* SSS */}
      {faqs.length > 0 && (
        <Section>
          <div className="container-page">
            <SectionHeading
              eyebrow="Sık sorulan sorular"
              title="Merak ettikleriniz"
              description="Aradığınız cevabı bulamadıysanız bizi arayabilirsiniz."
            />
            <div className="mt-11">
              <FaqAccordion items={faqs} />
            </div>
          </div>
          <FaqJsonLd
            items={faqs.map((f) => ({ question: f.question, answer: f.answer }))}
          />
        </Section>
      )}
    </>
  );
}
