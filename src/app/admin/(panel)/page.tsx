import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Phone,
} from "lucide-react";
import { PageHeader } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { db } from "@/lib/db";
import { dateKeyToUtcDate, formatDateKeyTr, getClinicNow, addDaysToKey } from "@/lib/hours";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = getClinicNow();
  const today = dateKeyToUtcDate(now.date);
  const weekEnd = dateKeyToUtcDate(addDaysToKey(now.date, 7));

  const [pendingCount, todayList, weekCount, recent] = await Promise.all([
    db.appointment.count({ where: { status: "PENDING" } }),
    db.appointment.findMany({
      where: { date: today, status: { in: ["PENDING", "CONFIRMED"] } },
      orderBy: { time: "asc" },
    }),
    db.appointment.count({
      where: {
        date: { gte: today, lte: weekEnd },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    db.appointment.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const stats = [
    {
      label: "Onay bekleyen",
      value: pendingCount,
      icon: AlertCircle,
      tone: pendingCount > 0 ? "warning" : "neutral",
      href: "/admin/randevular?durum=PENDING",
    },
    {
      label: "Bugünkü randevu",
      value: todayList.length,
      icon: CalendarClock,
      tone: "brand",
      href: "/admin/randevular",
    },
    {
      label: "Bu hafta",
      value: weekCount,
      icon: Clock,
      tone: "neutral",
      href: "/admin/randevular",
    },
  ] as const;

  return (
    <>
      <PageHeader
        title="Panel"
        description={`${formatDateKeyTr(now.date)} · saat ${now.time}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone, href }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "rounded-card border bg-white p-5 transition-all hover:shadow-sm",
              tone === "warning"
                ? "border-warning/30 bg-warning-soft"
                : "border-line",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{label}</p>
              <Icon
                className={cn(
                  "size-5",
                  tone === "warning"
                    ? "text-warning"
                    : tone === "brand"
                      ? "text-brand"
                      : "text-muted",
                )}
                aria-hidden
              />
            </div>
            <p className="mt-2 font-head text-3xl font-extrabold text-navy">
              {value}
            </p>
          </Link>
        ))}
      </div>

      {/* Bugünün programı */}
      <section className="mt-8">
        <h2 className="mb-4 font-head text-lg font-bold text-navy">
          Bugünün programı
        </h2>

        {todayList.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-white p-8 text-center text-muted">
            Bugün için randevu bulunmuyor.
          </p>
        ) : (
          <ul className="grid gap-2">
            {/*
              Kartın tamamı bağlantı değil: iç içe bağlantı geçersiz HTML ve
              hydration hatası veriyordu. Telefonu aramak ile detayı açmak
              artık iki ayrı bağlantı.
            */}
            {todayList.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-white p-4 transition-colors hover:border-brand-line"
              >
                <span className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-brand-soft py-2 font-head font-bold text-brand-dark tabular-nums">
                  {a.time}
                </span>

                <span className="min-w-0 flex-1">
                  <Link
                    href={`/admin/randevular/${a.id}`}
                    className="block truncate font-semibold text-navy transition-colors hover:text-brand"
                  >
                    {a.petName}
                    <span className="ml-2 font-normal text-muted">
                      · {a.ownerName}
                    </span>
                  </Link>
                  <span className="block truncate text-sm text-muted">
                    {a.serviceLabel}
                  </span>
                </span>

                <a
                  href={`tel:${a.phone}`}
                  className="flex items-center gap-1.5 rounded-pill border border-line px-3 py-1.5 text-sm font-medium text-navy transition-colors hover:border-brand hover:text-brand"
                >
                  <Phone className="size-3.5" aria-hidden />
                  {a.phone}
                </a>

                <StatusBadge status={a.status} />

                <Link
                  href={`/admin/randevular/${a.id}`}
                  className="text-sm font-semibold whitespace-nowrap text-brand hover:underline"
                >
                  Detay
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Son talepler */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-head text-lg font-bold text-navy">
            Son gelen talepler
          </h2>
          <Link
            href="/admin/randevular"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            Tümü
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-white p-8 text-center text-muted">
            Henüz randevu talebi yok.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-white">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="border-b border-line bg-cream text-left">
                <tr>
                  <th className="p-3 font-semibold text-navy">Tarih</th>
                  <th className="p-3 font-semibold text-navy">Hasta</th>
                  <th className="p-3 font-semibold text-navy">Hizmet</th>
                  <th className="p-3 font-semibold text-navy">Durum</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <td className="p-3 whitespace-nowrap text-navy tabular-nums">
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        timeZone: "UTC",
                      }).format(a.date)}{" "}
                      {a.time}
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-navy">{a.petName}</span>
                      <span className="block text-xs text-muted">
                        {a.ownerName}
                      </span>
                    </td>
                    <td className="p-3 text-navy">{a.serviceLabel}</td>
                    <td className="p-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/randevular/${a.id}`}
                        className="font-semibold text-brand hover:underline"
                      >
                        Aç
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pendingCount > 0 && (
        <p className="mt-8 flex items-center gap-2 rounded-card bg-brand-soft p-4 text-sm text-navy-deep">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          Onay bekleyen {pendingCount} talep var. Müşteriyi arayıp teyit ettikten
          sonra durumu &ldquo;Onaylandı&rdquo; olarak işaretleyin.
        </p>
      )}
    </>
  );
}
