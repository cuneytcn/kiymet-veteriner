import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Check, Clock, Heart, Phone, Siren } from "lucide-react";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section";
import { getBusinessHours, getUpcomingClosures } from "@/lib/content";
import { getSiteSettings, toTelHref } from "@/lib/site";
import {
  DAY_NAMES,
  addDaysToKey,
  dateKeyToUtcDate,
  filterPastSlots,
  generateSlots,
  getClinicNow,
  resolveDayWindow,
} from "@/lib/hours";

const featureBoxes = [
  {
    icon: Siren,
    title: "7/24 Acil Müdahale",
    text: "Zehirlenme, travma ve doğum güçlüğünde gece gündüz ulaşabilirsiniz.",
    cta: "Acil hattı ara",
    accent: "brand" as const,
  },
  {
    icon: CalendarCheck,
    title: "Online Randevu",
    text: "Müsait saatleri görün, size uygun olanı seçin. İki dakika sürer.",
    cta: "Randevu oluştur",
    href: "/randevu",
    accent: "leaf" as const,
  },
  {
    icon: Clock,
    title: "Geniş Çalışma Saati",
    text: "Hafta içi 21:00'a, cumartesi 20:00'a kadar açığız. Pazar da buradayız.",
    cta: "Saatleri gör",
    href: "/iletisim",
    accent: "sun" as const,
  },
];

const accentStyles = {
  brand: {
    bar: "bg-brand",
    icon: "bg-brand-soft text-brand",
  },
  leaf: {
    bar: "bg-leaf",
    icon: "bg-leaf-soft text-leaf-dark",
  },
  sun: {
    bar: "bg-sun",
    icon: "bg-sun-soft text-sun-dark",
  },
};

export async function Hero() {
  const [settings, hours, closures] = await Promise.all([
    getSiteSettings(),
    getBusinessHours(),
    getUpcomingClosures(),
  ]);

  // Hero rozeti: bugün müsaitlik varsa onu, yoksa sonraki müsait günü göster
  const now = getClinicNow();

  const countFor = (dateKey: string) =>
    filterPastSlots(
      dateKey,
      generateSlots(
        resolveDayWindow(dateKey, hours, closures),
        settings.slotDurationMinutes,
      ),
      settings.minLeadTimeHours,
      now,
    ).length;

  const remainingToday = countFor(now.date);

  // Bugün dolduysa ya da kapalıysak önümüzdeki bir hafta içinde ilk açık günü bul
  let nextOpen: { label: string; count: number } | null = null;

  if (remainingToday === 0) {
    for (let i = 1; i <= 7; i++) {
      const key = addDaysToKey(now.date, i);
      const count = countFor(key);
      if (count > 0) {
        nextOpen = {
          label:
            i === 1
              ? "Yarın"
              : DAY_NAMES[dateKeyToUtcDate(key).getUTCDay()],
          count,
        };
        break;
      }
    }
  }

  return (
    <section className="relative -mt-25 overflow-hidden md:-mt-40">
      {/* Zemin başlığın arkasına kadar uzansın: üst boşluk gradyanın İÇİNDE olmalı */}
      <div className="relative bg-[linear-gradient(160deg,#fdf1f5_0%,var(--color-cream)_38%,var(--color-cream)_100%)] pt-25 md:pt-40">
        {/* Sağ üstteki açık daire — referanstaki gibi zemini kırıyor */}
        <span
          className="pointer-events-none absolute -top-52 -right-52 size-[42rem] rounded-full bg-white/45 blur-[90px]"
          aria-hidden
        />

        <div className="container-page relative grid items-center gap-10 pt-9 lg:grid-cols-[1.04fr_0.96fr] lg:pt-12">
          <div>
            <Eyebrow label={`${settings.district} · ${settings.city}`} />

            <h1 className="mt-4 text-[2.25rem] leading-[1.14] sm:text-[2.75rem] lg:text-[3.625rem]">
              Dostunuza <em className="not-italic text-brand">en iyi bakımı</em>
              <br />
              birlikte verelim
            </h1>

            <p className="mt-5 max-w-[33em] text-[1.0625rem] leading-[1.9] text-muted">
              {settings.yearsOfExperience} yıldır {settings.district}&apos;da kedi ve köpeklerin
              yanındayız. Genel muayeneden ileri cerrahiye, aşıdan 7/24 acil
              müdahaleye kadar her şey tek çatı altında.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <ButtonLink href="/randevu" size="lg">
                <CalendarCheck aria-hidden />
                Randevu Al
              </ButtonLink>
              <ButtonAnchor
                href={toTelHref(settings.emergencyPhone)}
                variant="outline"
                size="lg"
              >
                <Phone aria-hidden />
                Acil Hat
              </ButtonAnchor>
            </div>
          </div>

          {/* Fotoğraf kompozisyonu — başlık kutusunun arkasına kadar uzanır */}
          <div className="relative">
            <div className="relative mx-auto aspect-[1/1.06] max-w-[28.75rem] overflow-hidden rounded-[50%_50%_46%_54%/48%_46%_54%_52%] shadow-lg">
              <Image
                src="/img/dog-smile.webp"
                alt="Gülümseyen, mutlu görünen bir köpek"
                fill
                sizes="(max-width: 1024px) 90vw, 460px"
                className="object-cover"
                priority
              />
            </div>

            {/* Noktalı desen */}
            <svg
              className="pointer-events-none absolute bottom-9 -left-6 -z-10 size-[7.25rem] text-sun opacity-80"
              viewBox="0 0 100 100"
              aria-hidden
            >
              <defs>
                <pattern
                  id="hero-dots"
                  width="14"
                  height="14"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="3" cy="3" r="2.6" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#hero-dots)" />
            </svg>

            {/* Yüzen bilgi kartları */}
            <div className="animate-bob absolute top-3.5 -left-1.5 flex items-center gap-3 rounded-[0.875rem] bg-white px-3.5 py-3 shadow-lg sm:top-13 sm:-left-2.5 sm:px-[1.0625rem]">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf-dark">
                <Check className="size-[1.1875rem]" aria-hidden />
              </span>
              <span>
                <span className="block text-[0.71875rem] leading-snug text-muted">
                  {remainingToday > 0
                    ? "Bugün"
                    : nextOpen
                      ? nextOpen.label
                      : "Randevu"}
                </span>
                <span className="block font-head text-[0.96875rem] leading-tight font-bold">
                  {remainingToday > 0
                    ? `${remainingToday} saat müsait`
                    : nextOpen
                      ? `${nextOpen.count} saat müsait`
                      : "Bizi arayın"}
                </span>
              </span>
            </div>

            <div
              className="animate-bob absolute right-[-0.375rem] bottom-4 flex items-center gap-3 rounded-[0.875rem] bg-white px-3.5 py-3 shadow-lg sm:right-[-0.5rem] sm:bottom-[4.125rem] sm:px-[1.0625rem]"
              style={{ animationDelay: "-2.2s" }}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                <Heart className="size-[1.1875rem]" aria-hidden />
              </span>
              <span>
                <span className="block text-[0.71875rem] leading-snug text-muted">
                  Mutlu hasta
                </span>
                <span className="block font-head text-[0.96875rem] leading-tight font-bold">
                  5.000+
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero ile beyaz alan arasına binen üç kutu */}
      <div className="bg-[linear-gradient(to_bottom,var(--color-cream)_68%,#fff_68%)]">
        <div className="container-page grid gap-[1.375rem] pt-14 sm:grid-cols-2 lg:grid-cols-3">
          {featureBoxes.map(({ icon: Icon, title, text, cta, href, accent }) => {
            const styles = accentStyles[accent];
            const target = href ?? toTelHref(settings.emergencyPhone);
            const isInternal = Boolean(href);

            const inner = (
              <>
                <span
                  className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-400 group-hover/box:scale-x-100 ${styles.bar}`}
                  aria-hidden
                />
                <span
                  className={`mx-auto grid size-[4.625rem] place-items-center rounded-full transition-transform duration-500 group-hover/box:[transform:rotateY(180deg)] ${styles.icon}`}
                >
                  <Icon className="size-[2.0625rem]" aria-hidden />
                </span>
                <h3 className="mt-5 text-xl">{title}</h3>
                <p className="mt-2.5 text-[0.96875rem] text-muted">{text}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-head text-[0.90625rem] font-semibold text-brand">
                  {cta}
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover/box:translate-x-1.5"
                    aria-hidden
                  />
                </span>
              </>
            );

            const className =
              "group/box reveal relative block overflow-hidden rounded-card bg-white px-6 py-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-md";

            return isInternal ? (
              <Link key={title} href={target} className={className}>
                {inner}
              </Link>
            ) : (
              <a key={title} href={target} className={className}>
                {inner}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
