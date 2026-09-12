import { notFound } from "next/navigation";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  AdminNoteEditor,
  DeleteAppointmentButton,
  StatusSwitcher,
} from "@/components/admin/appointment-actions";
import { db } from "@/lib/db";
import { formatDateKeyTr, utcDateToKey } from "@/lib/hours";
import { toWhatsappHref } from "@/lib/site";
import { PET_TYPES } from "@/lib/validation/appointment";

export const dynamic = "force-dynamic";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const appointment = await db.appointment.findUnique({ where: { id } });
  if (!appointment) notFound();

  const a = appointment;
  const dateKey = utcDateToKey(a.date);
  const petTypeLabel =
    PET_TYPES.find((p) => p.value === a.petType)?.label ?? "Diğer";

  const rows: [string, React.ReactNode][] = [
    ["Hizmet", a.serviceLabel],
    ["Hayvan", `${a.petName} (${petTypeLabel})`],
    ["Irk", a.petBreed || "—"],
    ["Yaş", a.petAge || "—"],
    ["Sahibi", a.ownerName],
    [
      "Telefon",
      <a
        key="phone"
        href={`tel:${a.phone}`}
        className="font-semibold text-brand hover:underline"
      >
        {a.phone}
      </a>,
    ],
    [
      "E-posta",
      <a
        key="email"
        href={`mailto:${a.email}`}
        className="text-brand hover:underline"
      >
        {a.email}
      </a>,
    ],
    ["Adres", a.address || "—"],
    ["Müşteri notu", a.notes || "—"],
    [
      "Talep zamanı",
      new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
      }).format(a.createdAt),
    ],
    [
      "Bildirim",
      [
        a.notifiedEmail ? "E-posta gönderildi" : "E-posta gönderilmedi",
        a.notifiedWhatsapp ? "WhatsApp gönderildi" : "WhatsApp gönderilmedi",
      ].join(" · "),
    ],
  ];

  return (
    <>
      <PageHeader
        title={`${a.petName} · ${a.ownerName}`}
        description={`${formatDateKeyTr(dateKey)} · saat ${a.time}`}
        backHref="/admin/randevular"
        action={<StatusBadge status={a.status} className="mt-1" />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-6">
          <section className="rounded-card border border-line bg-white p-6">
            <StatusSwitcher id={a.id} current={a.status} />
          </section>

          <section className="rounded-card border border-line bg-white p-6">
            <h2 className="mb-4 font-head text-lg font-bold text-navy">
              Randevu bilgileri
            </h2>
            <dl className="grid gap-0">
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 border-b border-line py-3 last:border-0 sm:grid-cols-[10rem_1fr] sm:gap-4"
                >
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="text-[0.9375rem] break-words text-navy">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-card border border-line bg-white p-6">
            <AdminNoteEditor id={a.id} initial={a.adminNote ?? ""} />
          </section>

          <DeleteAppointmentButton id={a.id} />
        </div>

        {/* Hızlı işlemler */}
        <aside className="grid h-fit gap-3">
          <a
            href={`tel:${a.phone}`}
            className="flex h-12 items-center justify-center gap-2 rounded-pill bg-brand font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <Phone className="size-4" aria-hidden />
            Müşteriyi ara
          </a>

          <a
            href={toWhatsappHref(
              a.phone,
              `Merhaba ${a.ownerName}, ${formatDateKeyTr(dateKey)} saat ${a.time} randevunuz için arıyoruz.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-pill border border-line bg-white font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp ile yaz
          </a>

          <a
            href={`mailto:${a.email}`}
            className="flex h-12 items-center justify-center gap-2 rounded-pill border border-line bg-white font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
          >
            <Mail className="size-4" aria-hidden />
            E-posta gönder
          </a>

          {a.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-pill border border-line bg-white font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
            >
              <MapPin className="size-4" aria-hidden />
              Adresi haritada aç
            </a>
          )}
        </aside>
      </div>
    </>
  );
}
