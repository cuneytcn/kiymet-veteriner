"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, Clock, Loader2, PawPrint, User } from "lucide-react";
import type { Service } from "@prisma/client";
import type { DayAvailability, DaySummary, SlotInfo } from "@/lib/appointments";
import { formatDateKeyTr } from "@/lib/hours";
import { PET_TYPES } from "@/lib/validation/appointment";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  createAppointment,
  fetchDayAvailability,
  type AppointmentResult,
} from "@/app/(site)/randevu/actions";
import { DateStrip } from "./date-picker";

type Props = {
  services: Pick<Service, "id" | "title">[];
  days: DaySummary[];
  clinicPhone: string;
};

export function AppointmentForm({ services, days, clinicPhone }: Props) {
  const [state, formAction, isSubmitting] = useActionState<
    AppointmentResult | null,
    FormData
  >(createAppointment, null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [isLoadingSlots, startLoadingSlots] = useTransition();

  const toast = useToast();
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const errors = state?.ok === false ? (state.fieldErrors ?? {}) : {};

  // Tarih değişince o günün saatlerini getir
  useEffect(() => {
    if (!selectedDate) return;
    setSelectedTime(null);

    startLoadingSlots(async () => {
      const result = await fetchDayAvailability(selectedDate);
      setAvailability(result as DayAvailability);
    });
  }, [selectedDate]);

  // Sonuç geldiğinde odağı taşı — ekran okuyucu ve mobil için önemli
  useEffect(() => {
    if (state?.ok) {
      successRef.current?.focus();
      toast.success({
        title: "Randevu talebiniz alındı",
        description: "Ekibimiz sizi arayarak teyit edecek.",
      });
    } else if (state?.ok === false) {
      errorRef.current?.focus();
      toast.error({ title: "Gönderilemedi", description: state.message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state?.ok) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="rounded-card border border-success/30 bg-success-soft p-8 text-center focus:outline-none"
      >
        <CheckCircle2
          className="mx-auto size-14 text-success"
          aria-hidden
        />
        <h2 className="mt-5 font-head text-2xl font-bold text-navy">
          Randevu talebiniz alındı
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-navy">
          <strong>{formatDateKeyTr(state.date)}</strong> günü saat{" "}
          <strong>{state.time}</strong> için talebiniz bize ulaştı. Ekibimiz en
          kısa sürede sizi arayarak randevunuzu teyit edecek.
        </p>
        <p className="mt-4 text-sm text-muted">
          Acil bir durumunuz varsa lütfen bizi doğrudan arayın:{" "}
          <a href={`tel:${clinicPhone}`} className="font-semibold text-brand">
            {clinicPhone}
          </a>
        </p>
        <div className="mt-7">
          <Link
            href="/"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  const slotGroups = availability ? groupSlots(availability.slots) : null;

  return (
    <form action={formAction} className="grid min-w-0 gap-8" noValidate>
      {/* Bal küpü — ekran okuyucudan ve kullanıcıdan gizli */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label htmlFor="website">Web siteniz</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* 1 — Tarih ve saat */}
      <section className="rounded-card border border-line bg-white p-6 md:p-7">
        <StepHeading
          number={1}
          icon={CalendarCheck}
          title="Tarih ve saat"
          description="Müsait saatlerimiz anlık olarak gösterilir."
        />

        <div className="mt-6">
          <DateStrip
            days={days}
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        </div>

        <input type="hidden" name="date" value={selectedDate ?? ""} />
        <input type="hidden" name="time" value={selectedTime ?? ""} />

        <div className="mt-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy">
            <Clock className="size-4 text-brand" aria-hidden />
            Saat seçin
          </p>

          {!selectedDate && (
            <p className="rounded-xl border border-dashed border-line p-5 text-center text-sm text-muted">
              Önce yukarıdan bir tarih seçin.
            </p>
          )}

          {selectedDate && isLoadingSlots && (
            <p className="flex items-center justify-center gap-2 rounded-xl border border-line p-5 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Müsait saatler yükleniyor...
            </p>
          )}

          {selectedDate && !isLoadingSlots && availability?.isClosed && (
            <p className="rounded-xl border border-line bg-cream p-5 text-center text-sm text-muted">
              {availability.reason ?? "Bu tarihte kapalıyız."} Lütfen başka bir
              gün seçin.
            </p>
          )}

          {selectedDate && !isLoadingSlots && slotGroups && !availability?.isClosed && (
            <div className="grid gap-5">
              {slotGroups.map(([label, slots]) => (
                <div key={label}>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
                    {label}
                  </p>
                  <div
                    className="grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-2"
                    role="radiogroup"
                    aria-label={`${label} saatleri`}
                  >
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        role="radio"
                        aria-checked={selectedTime === slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={cn(
                          "h-11 rounded-xl border-2 text-sm font-semibold tabular-nums transition-all",
                          selectedTime === slot.time
                            ? "border-brand bg-brand text-white"
                            : slot.available
                              ? "border-line bg-white text-navy hover:border-brand hover:bg-brand-soft"
                              : "cursor-not-allowed border-line bg-cream text-muted line-through",
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {availability?.isFull && (
                <p className="rounded-xl bg-warning-soft p-4 text-sm text-navy">
                  Bu günün tüm saatleri dolu. Başka bir gün seçebilir veya bizi
                  arayabilirsiniz.
                </p>
              )}
            </div>
          )}

          {errors.date && (
            <p role="alert" className="mt-3 text-xs font-medium text-danger">
              {errors.date}
            </p>
          )}
          {errors.time && (
            <p role="alert" className="mt-3 text-xs font-medium text-danger">
              {errors.time}
            </p>
          )}
        </div>
      </section>

      {/* 2 — Hasta bilgileri */}
      <section className="rounded-card border border-line bg-white p-6 md:p-7">
        <StepHeading
          number={2}
          icon={PawPrint}
          title="Dostunuz hakkında"
          description="Muayeneye hazırlanabilmemiz için birkaç bilgi."
        />

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Hayvanın adı" htmlFor="petName" required error={errors.petName}>
            <Input
              id="petName"
              name="petName"
              placeholder="Örn. Pamuk"
              autoComplete="off"
              error={!!errors.petName}
            />
          </Field>

          <Field label="Türü" htmlFor="petType" required error={errors.petType}>
            <Select id="petType" name="petType" defaultValue="" error={!!errors.petType}>
              <option value="" disabled>
                Seçiniz
              </option>
              {PET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Irk" htmlFor="petBreed" hint="Biliyorsanız" error={errors.petBreed}>
            <Input id="petBreed" name="petBreed" placeholder="Örn. Tekir" />
          </Field>

          <Field label="Yaş" htmlFor="petAge" hint="Yaklaşık olabilir" error={errors.petAge}>
            <Input id="petAge" name="petAge" placeholder="Örn. 3 yaş" />
          </Field>

          <Field
            label="Hizmet türü"
            htmlFor="serviceId"
            required
            error={errors.serviceId}
            className="sm:col-span-2"
          >
            <Select id="serviceId" name="serviceId" defaultValue="" error={!!errors.serviceId}>
              <option value="" disabled>
                Seçiniz
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Şikayet / notlarınız"
            htmlFor="notes"
            hint="Belirtiler, süresi, kullandığı ilaçlar"
            error={errors.notes}
            className="sm:col-span-2"
          >
            <Textarea
              id="notes"
              name="notes"
              placeholder="Örn. İki gündür iştahsız, halsiz görünüyor."
            />
          </Field>
        </div>
      </section>

      {/* 3 — İletişim */}
      <section className="rounded-card border border-line bg-white p-6 md:p-7">
        <StepHeading
          number={3}
          icon={User}
          title="Size nasıl ulaşalım"
          description="Randevunuzu teyit etmek için arayacağız."
        />

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Ad soyad" htmlFor="ownerName" required error={errors.ownerName}>
            <Input
              id="ownerName"
              name="ownerName"
              autoComplete="name"
              placeholder="Adınız ve soyadınız"
              error={!!errors.ownerName}
            />
          </Field>

          <Field label="Telefon" htmlFor="phone" required error={errors.phone}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0555 555 55 55"
              error={!!errors.phone}
            />
          </Field>

          <Field label="E-posta" htmlFor="email" required error={errors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="ornek@eposta.com"
              error={!!errors.email}
            />
          </Field>

          <Field label="Adres" htmlFor="address" hint="Zorunlu değil" error={errors.address}>
            <Input id="address" name="address" autoComplete="street-address" />
          </Field>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-navy">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 size-5 shrink-0 rounded border-line accent-[var(--color-brand)]"
          />
          <span>
            <Link
              href="/kvkk"
              className="font-semibold text-brand underline-offset-2 hover:underline"
            >
              KVKK aydınlatma metnini
            </Link>{" "}
            ve{" "}
            <Link
              href="/gizlilik-politikasi"
              className="font-semibold text-brand underline-offset-2 hover:underline"
            >
              gizlilik politikasını
            </Link>{" "}
            okudum, bilgilerimin randevu amacıyla işlenmesini onaylıyorum.
            <span className="text-danger" aria-hidden>
              {" *"}
            </span>
          </span>
        </label>
        {errors.consent && (
          <p role="alert" className="mt-2 text-xs font-medium text-danger">
            {errors.consent}
          </p>
        )}
      </section>

      {state?.ok === false && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm font-medium text-danger focus:outline-none"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col items-center gap-4">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full sm:w-auto sm:min-w-72"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Gönderiliyor...
            </>
          ) : (
            "Randevu Talebimi Gönder"
          )}
        </Button>

        <p className="max-w-md text-center text-xs leading-relaxed text-muted">
          Talebiniz onaya düşer; ekibimiz telefonla teyit ettiğinde randevunuz
          kesinleşir. Acil durumlar için lütfen doğrudan arayın.
        </p>
      </div>
    </form>
  );
}

function StepHeading({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: number;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <h2 className="font-head text-lg font-bold text-navy">
          <span className="mr-2 text-brand">{number}.</span>
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

/** Saatleri sabah/öğleden sonra/akşam olarak grupla — uzun listeyi okunur kılar. */
function groupSlots(slots: SlotInfo[]): [string, SlotInfo[]][] {
  const groups: Record<string, SlotInfo[]> = {
    Sabah: [],
    "Öğleden sonra": [],
    Akşam: [],
  };

  for (const slot of slots) {
    const hour = Number(slot.time.slice(0, 2));
    if (hour < 12) groups["Sabah"].push(slot);
    else if (hour < 17) groups["Öğleden sonra"].push(slot);
    else groups["Akşam"].push(slot);
  }

  return Object.entries(groups).filter(([, list]) => list.length > 0);
}
