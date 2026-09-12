import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone, Siren } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { getBusinessHours, getUpcomingClosures } from "@/lib/content";
import {
  formatAddress,
  getSiteSettings,
  toTelHref,
  toWhatsappHref,
} from "@/lib/site";
import { DAY_NAMES, WEEK_ORDER, getClinicNow, isOpenNow } from "@/lib/hours";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: "İletişim ve Yol Tarifi",
    description: `${s.clinicName} adresi, telefonu ve çalışma saatleri. ${formatAddress(s)}. Acil hat 7/24 açık.`,
    alternates: { canonical: "/iletisim" },
  };
}

export default async function ContactPage() {
  const [settings, hours, closures] = await Promise.all([
    getSiteSettings(),
    getBusinessHours(),
    getUpcomingClosures(),
  ]);

  const now = getClinicNow();
  const open = isOpenNow(hours, closures, now);
  const address = formatAddress(settings);

  // Koordinat girilmişse haritayı doğrudan göm; yoksa adresle arama yap
  const mapQuery =
    settings.latitude && settings.longitude
      ? `${settings.latitude},${settings.longitude}`
      : address;

  const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&hl=tr&z=16&output=embed`;

  const directionsUrl =
    settings.mapsUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`;

  const crumbs = [
    { name: "Ana Sayfa", href: "/" },
    { name: "İletişim", href: "/iletisim" },
  ];

  const channels = [
    {
      icon: Phone,
      label: "Telefon",
      value: settings.phone,
      href: toTelHref(settings.phone),
      note: "Klinik saatlerinde",
      tone: "bg-brand-soft text-brand",
    },
    {
      icon: Siren,
      label: "Acil hat",
      value: settings.emergencyPhone,
      href: toTelHref(settings.emergencyPhone),
      note: "7 gün 24 saat",
      tone: "bg-danger-soft text-danger",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.whatsappNumber || settings.emergencyPhone,
      href: toWhatsappHref(
        settings.whatsappNumber || settings.emergencyPhone,
        "Merhaba, bilgi almak istiyorum.",
      ),
      note: "Mesaj bırakın",
      tone: "bg-leaf-soft text-leaf-dark",
    },
    {
      icon: Mail,
      label: "E-posta",
      value: settings.email,
      href: `mailto:${settings.email}`,
      note: "Aynı gün dönüş",
      tone: "bg-sun-soft text-sun-dark",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="İletişim"
        title="Bize ulaşın"
        description={`${settings.district} ${settings.city}'deki kliniğimize gelebilir, arayabilir veya online randevu oluşturabilirsiniz.`}
        crumbs={crumbs}
      />

      {/* İletişim kanalları */}
      <Section className="py-14 md:py-16">
        <div className="container-page grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map(({ icon: Icon, label, value, href, note, tone }) => (
            <a
              key={label}
              href={href}
              target={label === "WhatsApp" ? "_blank" : undefined}
              rel={label === "WhatsApp" ? "noopener noreferrer" : undefined}
              className="group/ch reveal rounded-card bg-white px-6 py-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-md"
            >
              <span
                className={`mx-auto grid size-14 place-items-center rounded-full transition-transform duration-500 group-hover/ch:[transform:rotateY(180deg)] ${tone}`}
              >
                <Icon className="size-6" aria-hidden />
              </span>
              <h2 className="mt-4 font-head text-sm font-semibold tracking-wide text-muted uppercase">
                {label}
              </h2>
              <p className="mt-1 font-head text-[1.0625rem] font-bold break-words text-navy transition-colors group-hover/ch:text-brand">
                {value}
              </p>
              <p className="mt-1 text-[0.8125rem] text-muted">{note}</p>
            </a>
          ))}
        </div>
      </Section>

      {/* Harita + saatler */}
      <Section tone="cream" className="pt-0 md:pt-0">
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* Harita */}
          <div className="reveal overflow-hidden rounded-card bg-white shadow-sm">
            <iframe
              src={mapEmbed}
              title={`${settings.clinicName} konumu`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[22rem] w-full border-0 md:h-[28rem]"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <p className="flex items-start gap-3 text-[0.96875rem]">
                <MapPin className="mt-1 size-4.5 shrink-0 text-brand" aria-hidden />
                <span>
                  <span className="block font-head font-bold text-navy">
                    {settings.clinicName}
                  </span>
                  <span className="block text-muted">{address}</span>
                </span>
              </p>

              <ButtonAnchor
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="md"
              >
                <Navigation aria-hidden />
                Yol Tarifi Al
              </ButtonAnchor>
            </div>
          </div>

          {/* Çalışma saatleri */}
          <div className="reveal h-fit rounded-card bg-white px-7 py-7 shadow-sm">
            <h2 className="flex items-center gap-3 text-[1.375rem]">
              <Clock className="size-[1.4375rem] text-brand" aria-hidden />
              Çalışma Saatleri
            </h2>

            <p
              className={cn(
                "mt-3 inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-sm font-semibold",
                open
                  ? "bg-leaf-soft text-leaf-dark"
                  : "bg-cream-2 text-muted",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  open ? "bg-leaf" : "bg-muted",
                )}
                aria-hidden
              />
              {open ? "Şu anda açığız" : "Şu anda kapalıyız"}
            </p>

            <ul className="mt-5">
              {WEEK_ORDER.map((day) => {
                const h = hours.find((x) => x.dayOfWeek === day);
                const isToday = day === now.dayOfWeek;

                return (
                  <li
                    key={day}
                    className={cn(
                      "-mx-3 flex justify-between gap-3.5 rounded-lg px-3 py-2.5 text-[0.96875rem]",
                      isToday && "bg-brand-soft",
                    )}
                  >
                    <span
                      className={cn(
                        "font-head font-semibold",
                        isToday ? "text-brand" : "text-navy",
                      )}
                    >
                      {DAY_NAMES[day]}
                    </span>
                    <span
                      className={cn(
                        "tabular-nums",
                        isToday ? "font-bold text-brand" : "text-muted",
                      )}
                    >
                      {!h || h.isClosed
                        ? "Kapalı"
                        : `${h.openTime} – ${h.closeTime}`}
                    </span>
                  </li>
                );
              })}
            </ul>

            {closures.length > 0 && (
              <div className="mt-4 rounded-xl bg-sun-soft px-4 py-3">
                <p className="font-head text-sm font-bold text-sun-dark">
                  Yaklaşan kapanışlar
                </p>
                <ul className="mt-1.5 grid gap-1 text-[0.84375rem] text-sun-dark">
                  {closures.slice(0, 4).map((c) => (
                    <li key={c.id}>
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "numeric",
                        month: "long",
                        timeZone: "UTC",
                      }).format(c.date)}
                      {" — "}
                      {c.allDay ? "kapalı" : `${c.openTime} – ${c.closeTime}`}
                      {c.reason ? ` (${c.reason})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 flex items-center gap-2.5 rounded-xl bg-danger-soft px-4 py-3 text-[0.9375rem] font-semibold text-danger">
              <Siren className="size-4.5 shrink-0" aria-hidden />
              Acil durumlarda 7/24 ulaşabilirsiniz
            </p>

            <ButtonLink href="/randevu" size="md" block className="mt-5">
              Online Randevu Al
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* Ulaşım notu */}
      <Section className="py-14 md:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Kliniğe gelirken"
            title="Ziyaretinizi kolaylaştıralım"
            description="Gelmeden önce bilmenizde fayda olan birkaç not."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Kedinizi taşıma kabında getirin",
                text: "Klinikte başka hayvanlar da bulunur; kapalı bir taşıma kabı dostunuzun stresini belirgin biçimde azaltır.",
              },
              {
                title: "Köpeğinizi tasmalı tutun",
                text: "Bekleme alanında diğer hastalarla temasını sınırlamak hem güvenlik hem hijyen açısından önemli.",
              },
              {
                title: "Geçmiş kayıtlarını yanınıza alın",
                text: "Aşı karnesi, önceki tahlil sonuçları ve kullandığı ilaçların isimleri teşhisi hızlandırır.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="reveal rounded-card bg-cream px-6 py-6"
              >
                <h3 className="text-[1.09375rem]">{item.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <BreadcrumbJsonLd items={crumbs} />
    </>
  );
}
