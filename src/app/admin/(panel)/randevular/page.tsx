import Link from "next/link";
import type { AppointmentStatus, Prisma } from "@prisma/client";
import { Phone, Search } from "lucide-react";
import { PageHeader } from "@/components/admin/admin-shell";
import { StatusBadge, STATUS_LABELS } from "@/components/admin/status-badge";
import { db } from "@/lib/db";
import { dateKeyToUtcDate, getClinicNow } from "@/lib/hours";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type SearchParams = Promise<{
  durum?: string;
  q?: string;
  sayfa?: string;
  gecmis?: string;
}>;

const filters = [
  { value: "", label: "Tümü" },
  { value: "PENDING", label: "Onay bekleyen" },
  { value: "CONFIRMED", label: "Onaylanan" },
  { value: "COMPLETED", label: "Tamamlanan" },
  { value: "CANCELLED", label: "İptal" },
  { value: "NO_SHOW", label: "Gelmeyen" },
];

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const now = getClinicNow();

  const status = filters.some((f) => f.value === params.durum && f.value)
    ? (params.durum as AppointmentStatus)
    : undefined;

  const query = params.q?.trim() ?? "";
  const showPast = params.gecmis === "1";
  const page = Math.max(1, Number(params.sayfa) || 1);

  const where: Prisma.AppointmentWhereInput = {
    ...(status ? { status } : {}),
    ...(showPast ? {} : { date: { gte: dateKeyToUtcDate(now.date) } }),
    ...(query
      ? {
          OR: [
            { ownerName: { contains: query, mode: "insensitive" } },
            { petName: { contains: query, mode: "insensitive" } },
            { phone: { contains: query } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, appointments] = await Promise.all([
    db.appointment.count({ where }),
    db.appointment.findMany({
      where,
      orderBy: showPast ? [{ date: "desc" }, { time: "desc" }] : [{ date: "asc" }, { time: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = {
      durum: params.durum,
      q: query || undefined,
      gecmis: showPast ? "1" : undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const qs = sp.toString();
    return `/admin/randevular${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Randevular"
        description={`${total} kayıt${showPast ? "" : " · yaklaşan randevular"}`}
      />

      {/* Filtreler */}
      <div className="mb-5 grid gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = (params.durum ?? "") === f.value;
            return (
              <Link
                key={f.value || "all"}
                href={buildHref({ durum: f.value || undefined, sayfa: undefined })}
                className={cn(
                  "rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-white text-navy hover:border-brand-line",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form action="/admin/randevular" className="flex flex-1 gap-2">
            {params.durum && <input type="hidden" name="durum" value={params.durum} />}
            {showPast && <input type="hidden" name="gecmis" value="1" />}
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="İsim, telefon veya e-posta ara"
                className="h-11 w-full rounded-xl border border-line bg-white pr-4 pl-10 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-xl bg-navy px-5 text-sm font-semibold text-white"
            >
              Ara
            </button>
          </form>

          <Link
            href={buildHref({ gecmis: showPast ? undefined : "1", sayfa: undefined })}
            className={cn(
              "rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors",
              showPast
                ? "border-brand bg-brand-soft text-brand-dark"
                : "border-line bg-white text-navy hover:border-brand-line",
            )}
          >
            {showPast ? "Geçmiş dahil" : "Geçmişi göster"}
          </Link>
        </div>
      </div>

      {appointments.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-white p-10 text-center text-muted">
          Bu filtreye uyan randevu bulunamadı.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="border-b border-line bg-cream text-left">
              <tr>
                <th className="p-3 font-semibold text-navy">Tarih / Saat</th>
                <th className="p-3 font-semibold text-navy">Hasta</th>
                <th className="p-3 font-semibold text-navy">Hizmet</th>
                <th className="p-3 font-semibold text-navy">İletişim</th>
                <th className="p-3 font-semibold text-navy">Durum</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-line transition-colors last:border-0 hover:bg-cream"
                >
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-semibold text-navy tabular-nums">
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        timeZone: "UTC",
                      }).format(a.date)}
                    </span>
                    <span className="ml-2 text-muted tabular-nums">{a.time}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-navy">{a.petName}</span>
                    <span className="block text-xs text-muted">{a.ownerName}</span>
                  </td>
                  <td className="p-3 text-navy">{a.serviceLabel}</td>
                  <td className="p-3">
                    <a
                      href={`tel:${a.phone}`}
                      className="inline-flex items-center gap-1.5 font-medium text-navy hover:text-brand"
                    >
                      <Phone className="size-3.5" aria-hidden />
                      {a.phone}
                    </a>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/randevular/${a.id}`}
                      className="font-semibold whitespace-nowrap text-brand hover:underline"
                    >
                      Detay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="mt-6 flex items-center justify-center gap-2"
          aria-label="Sayfalama"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ sayfa: String(p) })}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "flex size-10 items-center justify-center rounded-lg border text-sm font-medium",
                p === page
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white text-navy hover:border-brand-line",
              )}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}

      <p className="sr-only">
        Durum açıklamaları: {Object.values(STATUS_LABELS).join(", ")}
      </p>
    </>
  );
}
