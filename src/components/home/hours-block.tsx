import {
  Clock,
  MessageSquare,
  Phone,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { getBusinessHours, getUpcomingClosures } from "@/lib/content";
import { getSiteSettings, toTelHref } from "@/lib/site";
import { DAY_NAMES, WEEK_ORDER, getClinicNow } from "@/lib/hours";
import { SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Modern ekipman",
    text: "Röntgen, ultrason ve klinik içi laboratuvar aynı çatı altında.",
    tone: "bg-brand-soft text-brand",
  },
  {
    icon: Users,
    title: "Aynı hekim, aynı takip",
    text: "Dostunuzu her ziyarette tanıyan bir ekip; geçmişi kayıt altında.",
    tone: "bg-leaf-soft text-leaf-dark",
  },
  {
    icon: TrendingUp,
    title: "Şeffaf fiyatlandırma",
    text: "Ücretleri işlem öncesinde net olarak paylaşıyoruz.",
    tone: "bg-sun-soft text-sun-dark",
  },
  {
    icon: MessageSquare,
    title: "Sürekli iletişim",
    text: "Aşı zamanı ve kontrol tarihleri için hatırlatma mesajı.",
    tone: "bg-navy-soft text-navy",
  },
];

export async function HoursBlock() {
  const [settings, hours, closures] = await Promise.all([
    getSiteSettings(),
    getBusinessHours(),
    getUpcomingClosures(),
  ]);

  const now = getClinicNow();

  return (
    <section className="relative overflow-hidden bg-navy-deep py-[4.625rem] md:py-section">
      <span
        className="pointer-events-none absolute -right-35 -bottom-35 size-[26.25rem] rounded-full bg-brand/9"
        aria-hidden
      />

      <div className="container-page relative grid gap-11 lg:grid-cols-[23.75rem_minmax(0,1fr)] lg:gap-14">
        {/* Çalışma saatleri kartı */}
        <div className="reveal h-fit rounded-card bg-white px-7 py-[1.875rem] shadow-lg">
          <h3 className="flex items-center gap-3 text-[1.375rem]">
            <Clock className="size-[1.4375rem] text-brand" aria-hidden />
            Çalışma Saatleri
          </h3>

          <ul className="mt-5">
            {WEEK_ORDER.map((day) => {
              const h = hours.find((x) => x.dayOfWeek === day);
              const isToday = day === now.dayOfWeek;

              return (
                <li
                  key={day}
                  className="flex justify-between gap-3.5 border-b border-dashed border-line py-[0.6875rem] text-[0.96875rem] last:border-0"
                >
                  <span className="font-head font-semibold text-navy">
                    {DAY_NAMES[day]}
                  </span>
                  <span
                    className={cn(
                      "tabular-nums",
                      isToday ? "font-bold text-leaf-dark" : "text-muted",
                    )}
                  >
                    {!h || h.isClosed
                      ? "Kapalı"
                      : `${h.openTime} – ${h.closeTime}`}
                  </span>
                </li>
              );
            })}

            <li className="flex justify-between gap-3.5 py-[0.6875rem] text-[0.96875rem]">
              <span className="font-head font-semibold text-navy">
                Acil Durumlar
              </span>
              <span className="font-bold text-brand tabular-nums">7 / 24</span>
            </li>
          </ul>

          {/* Yaklaşan tatiller — ziyaretçi boşuna gelmesin */}
          {closures.length > 0 && (
            <ul className="mt-3 grid gap-1 rounded-lg bg-sun-soft px-3.5 py-2.5 text-[0.8125rem] text-sun-dark">
              {closures.slice(0, 2).map((c) => (
                <li key={c.id}>
                  <strong className="font-semibold">
                    {new Intl.DateTimeFormat("tr-TR", {
                      day: "numeric",
                      month: "long",
                      timeZone: "UTC",
                    }).format(c.date)}
                  </strong>{" "}
                  {c.allDay ? "kapalıyız" : `${c.openTime} – ${c.closeTime}`}
                  {c.reason ? ` · ${c.reason}` : ""}
                </li>
              ))}
            </ul>
          )}

          <a
            href={toTelHref(settings.emergencyPhone)}
            className="mt-[1.375rem] flex items-center gap-3.5 rounded-xl bg-brand px-5 py-[1.0625rem] text-white transition-colors duration-300 hover:bg-brand-dark"
          >
            <Phone className="size-[1.625rem] shrink-0" aria-hidden />
            <span>
              <span className="block text-[0.78125rem] opacity-90">
                Acil hat, 7 gün 24 saat
              </span>
              <span className="block font-head text-[1.1875rem] leading-tight font-bold">
                {settings.emergencyPhone}
              </span>
            </span>
          </a>
        </div>

        {/* Neden biz */}
        <div className="reveal">
          <SectionHeading
            eyebrow="Neden biz"
            title="Kliniğimizi farklı kılan ne?"
            description="Dostunuzun sağlığı kadar sizin içiniz de rahat olsun diye çalışıyoruz."
            align="left"
            tone="dark"
          />

          <div className="mt-8 grid gap-6.5 sm:grid-cols-2">
            {reasons.map(({ icon: Icon, title, text, tone }) => (
              <div key={title} className="flex gap-4">
                <span
                  className={`grid size-13 shrink-0 place-items-center rounded-full ${tone}`}
                >
                  <Icon className="size-[1.4375rem]" aria-hidden />
                </span>
                <div>
                  <h3 className="text-[1.09375rem] text-white">{title}</h3>
                  <p className="mt-1 text-[0.90625rem] leading-relaxed text-muted-light">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
