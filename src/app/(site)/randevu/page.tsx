import type { Metadata } from "next";
import { Clock, MapPin, Phone, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { AppointmentForm } from "@/components/appointment/appointment-form";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { getBusinessHours, getFaqs, getServices } from "@/lib/content";
import { getRangeAvailability } from "@/lib/appointments";
import { formatAddress, getSiteSettings, toTelHref } from "@/lib/site";
import { DAY_NAMES, WEEK_ORDER, getClinicNow } from "@/lib/hours";
import { cn } from "@/lib/utils";

/** Slot durumu anlık olmalı — bu sayfa önbelleğe alınmaz. */
export const dynamic = "force-dynamic";

const CALENDAR_DAYS = 21;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: "Online Randevu Al",
    description: `${s.district} ${s.clinicName} için online randevu oluşturun. Müsait saatleri görün, dakikalar içinde randevunuzu alın.`,
    alternates: { canonical: "/randevu" },
    openGraph: {
      title: `Online Randevu | ${s.clinicName}`,
      description: "Müsait saatleri görün, randevunuzu dakikalar içinde alın.",
      url: "/randevu",
      images: ["/og.png"],
    },
  };
}

export default async function AppointmentPage() {
  const now = getClinicNow();

  const [services, days, settings, hours, faqs] = await Promise.all([
    getServices(),
    getRangeAvailability(now.date, CALENDAR_DAYS),
    getSiteSettings(),
    getBusinessHours(),
    getFaqs("randevu"),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Online randevu"
        title="Dostunuz için randevu oluşturun"
        description="Müsait saatlerimizi görün, size uygun olanı seçin. Talebiniz bize ulaştığında sizi arayarak teyit ediyoruz."
        crumbs={[
          { name: "Ana Sayfa", href: "/" },
          { name: "Randevu Al", href: "/randevu" },
        ]}
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        <div>
          {services.length === 0 ? (
            <p className="rounded-card border border-dashed border-line p-8 text-center text-muted">
              Randevu sistemi şu anda hazırlanıyor. Lütfen bizi telefonla arayın:{" "}
              <a
                href={toTelHref(settings.phone)}
                className="font-semibold text-brand"
              >
                {settings.phone}
              </a>
            </p>
          ) : (
            <AppointmentForm
              services={services.map((s) => ({ id: s.id, title: s.title }))}
              days={days}
              clinicPhone={settings.phone}
            />
          )}
        </div>

        {/* Yan panel */}
        <aside className="grid h-fit gap-5 lg:sticky lg:top-24">
          <div className="rounded-card border border-danger/30 bg-danger-soft p-5">
            <p className="font-head font-bold text-navy">Acil durum mu?</p>
            <p className="mt-1.5 text-sm leading-relaxed text-navy">
              Randevu beklemeyin, doğrudan arayın. Acil hattımız 7/24 açık.
            </p>
            <a
              href={toTelHref(settings.emergencyPhone)}
              className="mt-4 flex h-12 items-center justify-center gap-2 rounded-pill bg-danger font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Phone className="size-4" aria-hidden />
              {settings.emergencyPhone}
            </a>
          </div>

          <div className="rounded-card border border-line bg-white p-5">
            <p className="flex items-center gap-2 font-head font-bold text-navy">
              <Clock className="size-4 text-brand" aria-hidden />
              Çalışma saatleri
            </p>
            <dl className="mt-3 grid gap-1.5 text-sm">
              {WEEK_ORDER.map((day) => {
                const h = hours.find((x) => x.dayOfWeek === day);
                const isToday = day === now.dayOfWeek;
                return (
                  <div
                    key={day}
                    className={cn(
                      "-mx-2 flex justify-between gap-3 rounded-md px-2 py-1",
                      isToday && "bg-brand-soft font-semibold text-navy-deep",
                    )}
                  >
                    <dt className={cn(!isToday && "text-muted")}>
                      {DAY_NAMES[day]}
                    </dt>
                    <dd className={cn("tabular-nums", !isToday && "text-navy")}>
                      {!h || h.isClosed ? "Kapalı" : `${h.openTime} - ${h.closeTime}`}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="rounded-card border border-line bg-white p-5">
            <p className="flex items-center gap-2 font-head font-bold text-navy">
              <MapPin className="size-4 text-brand" aria-hidden />
              Adres
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {formatAddress(settings)}
            </p>
          </div>

          <div className="rounded-card bg-brand-soft p-5">
            <p className="flex items-center gap-2 font-head font-bold text-navy-deep">
              <ShieldCheck className="size-4" aria-hidden />
              Bilgileriniz güvende
            </p>
            <p className="mt-2 text-sm leading-relaxed text-brand-dark">
              Paylaştığınız bilgiler yalnızca randevunuzu oluşturmak ve sizinle
              iletişim kurmak için kullanılır.
            </p>
          </div>
        </aside>
      </div>

      {faqs.length > 0 && (
        <section className="border-t border-line bg-white py-16">
          <div className="container-page">
            <h2 className="mb-8 text-center font-head text-2xl font-bold text-navy">
              Randevu hakkında sık sorulanlar
            </h2>
            <FaqAccordion items={faqs} />
          </div>
          <FaqJsonLd
            items={faqs.map((f) => ({ question: f.question, answer: f.answer }))}
          />
        </section>
      )}

      <BreadcrumbJsonLd
        items={[
          { name: "Ana Sayfa", href: "/" },
          { name: "Randevu Al", href: "/randevu" },
        ]}
      />
    </>
  );
}
