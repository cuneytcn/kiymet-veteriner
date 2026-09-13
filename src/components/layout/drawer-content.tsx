import Image from "next/image";
import { Clock, Mail, MapPin, Phone, Siren } from "lucide-react";
import { getBusinessHours, getUpcomingClosures } from "@/lib/content";
import { formatAddress, getSiteSettings, toTelHref } from "@/lib/site";
import { getClinicNow, groupWeeklyHours, isOpenNow } from "@/lib/hours";
import { cn } from "@/lib/utils";

/** Başlıktaki nokta düğmesinin açtığı panelin içeriği. */
export async function DrawerContent() {
  const [settings, hours, closures] = await Promise.all([
    getSiteSettings(),
    getBusinessHours(),
    getUpcomingClosures(),
  ]);

  const now = getClinicNow();
  const open = isOpenNow(hours, closures, now);

  return (
    <div className="grid gap-6">
      <div>
        <Image
          src="/img/logo.webp"
          alt={settings.clinicName}
          width={600}
          height={201}
          sizes="160px"
          className="h-13 w-auto"
        />
      </div>

      {/* Anlık durum */}
      <p
        className={cn(
          "inline-flex w-fit items-center gap-2 rounded-pill px-3.5 py-1.5 text-sm font-semibold",
          open ? "bg-leaf-soft text-leaf-dark" : "bg-cream-2 text-muted",
        )}
      >
        <span
          className={cn("size-2 rounded-full", open ? "bg-leaf" : "bg-muted")}
          aria-hidden
        />
        {open ? "Şu anda açığız" : "Şu anda kapalıyız"}
      </p>

      {/* İletişim */}
      <div className="grid gap-4">
        <h2 className="font-head text-[1.0625rem] font-bold text-navy">
          İletişim
        </h2>

        <ul className="grid gap-3.5 text-[0.9375rem]">
          <li className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <span className="text-muted">{formatAddress(settings)}</span>
          </li>
          <li className="flex gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <a
              href={toTelHref(settings.phone)}
              className="font-semibold text-navy transition-colors hover:text-brand"
            >
              {settings.phone}
            </a>
          </li>
          <li className="flex gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <a
              href={`mailto:${settings.email}`}
              className="break-all text-muted transition-colors hover:text-brand"
            >
              {settings.email}
            </a>
          </li>
        </ul>
      </div>

      {/* Çalışma saatleri */}
      <div className="grid gap-3">
        <h2 className="flex items-center gap-2 font-head text-[1.0625rem] font-bold text-navy">
          <Clock className="size-4 text-brand" aria-hidden />
          Çalışma Saatleri
        </h2>

        <ul className="text-[0.875rem]">
          {groupWeeklyHours(hours).map((group) => {
            const isToday = group.days.includes(now.dayOfWeek);

            return (
              <li
                key={group.label}
                className={cn(
                  "-mx-2 flex justify-between gap-3 rounded-md px-2 py-1.5",
                  isToday && "bg-brand-soft font-semibold text-brand",
                )}
              >
                <span className={cn(!isToday && "text-navy")}>{group.label}</span>
                <span className={cn("tabular-nums", !isToday && "text-muted")}>
                  {group.value}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Acil hat */}
      <a
        href={toTelHref(settings.emergencyPhone)}
        className="flex items-center gap-3.5 rounded-card bg-brand px-5 py-4 text-white transition-colors hover:bg-brand-dark"
      >
        <Siren className="size-6 shrink-0" aria-hidden />
        <span>
          <span className="block text-[0.78125rem] opacity-90">
            Acil hat · 7 gün 24 saat
          </span>
          <span className="block font-head text-[1.0625rem] leading-tight font-bold">
            {settings.emergencyPhone}
          </span>
        </span>
      </a>

    </div>
  );
}
