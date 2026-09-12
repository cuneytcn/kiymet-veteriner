"use client";

import { useActionState, useEffect, useState } from "react";
import type { BusinessHour } from "@prisma/client";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DAY_NAMES, WEEK_ORDER } from "@/lib/hours";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { saveBusinessHours, type HoursState } from "./actions";

type Row = {
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  breakStart: string;
  breakEnd: string;
};

const DEFAULT_ROW: Row = {
  isClosed: false,
  openTime: "09:00",
  closeTime: "18:00",
  breakStart: "",
  breakEnd: "",
};

export function HoursForm({ hours }: { hours: BusinessHour[] }) {
  const [state, formAction, pending] = useActionState<HoursState, FormData>(
    saveBusinessHours,
    null,
  );

  const toast = useToast();

  useEffect(() => {
    if (state?.ok) toast.success({ title: "Çalışma saatleri kaydedildi" });
    else if (state?.error) toast.error({ title: "Kaydedilemedi", description: state.error });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const [rows, setRows] = useState<Record<number, Row>>(() => {
    const initial: Record<number, Row> = {};
    for (let d = 0; d <= 6; d++) {
      const existing = hours.find((h) => h.dayOfWeek === d);
      initial[d] = existing
        ? {
            isClosed: existing.isClosed,
            openTime: existing.openTime,
            closeTime: existing.closeTime,
            breakStart: existing.breakStart ?? "",
            breakEnd: existing.breakEnd ?? "",
          }
        : { ...DEFAULT_ROW };
    }
    return initial;
  });

  const update = (day: number, patch: Partial<Row>) =>
    setRows((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));

  /** Bir günün saatlerini diğer tüm açık günlere uygular. */
  const applyToAll = (day: number) => {
    const source = rows[day];
    setRows((prev) => {
      const next = { ...prev };
      for (let d = 0; d <= 6; d++) {
        if (d === day || next[d].isClosed) continue;
        next[d] = { ...next[d], ...source, isClosed: next[d].isClosed };
      }
      return next;
    });
  };

  return (
    <form action={formAction} className="grid gap-5">
      <div className="overflow-hidden rounded-card border border-line bg-white">
        {WEEK_ORDER.map((day) => {
          const row = rows[day];

          return (
            <div
              key={day}
              className={cn(
                "border-b border-line p-4 last:border-0 md:px-5",
                row.isClosed && "bg-cream",
              )}
            >
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <span className="w-24 shrink-0 font-semibold text-navy">
                  {DAY_NAMES[day]}
                </span>

                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
                  <input
                    type="checkbox"
                    name={`closed-${day}`}
                    checked={row.isClosed}
                    onChange={(e) => update(day, { isClosed: e.target.checked })}
                    className="size-4.5 rounded border-line accent-[var(--color-brand)]"
                  />
                  Kapalı
                </label>

                <div
                  className={cn(
                    "flex flex-wrap items-center gap-2",
                    row.isClosed && "pointer-events-none opacity-40",
                  )}
                >
                  <TimeInput
                    name={`open-${day}`}
                    label={`${DAY_NAMES[day]} açılış`}
                    value={row.openTime}
                    onChange={(v) => update(day, { openTime: v })}
                  />
                  <span className="text-muted">–</span>
                  <TimeInput
                    name={`close-${day}`}
                    label={`${DAY_NAMES[day]} kapanış`}
                    value={row.closeTime}
                    onChange={(v) => update(day, { closeTime: v })}
                  />

                  <span className="ml-3 text-sm text-muted">Mola:</span>
                  <TimeInput
                    name={`breakStart-${day}`}
                    label={`${DAY_NAMES[day]} mola başlangıcı`}
                    value={row.breakStart}
                    onChange={(v) => update(day, { breakStart: v })}
                    optional
                  />
                  <span className="text-muted">–</span>
                  <TimeInput
                    name={`breakEnd-${day}`}
                    label={`${DAY_NAMES[day]} mola bitişi`}
                    value={row.breakEnd}
                    onChange={(v) => update(day, { breakEnd: v })}
                    optional
                  />
                </div>

                {!row.isClosed && (
                  <button
                    type="button"
                    onClick={() => applyToAll(day)}
                    className="ml-auto text-sm font-semibold text-brand hover:underline"
                  >
                    Tüm açık günlere uygula
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted">
        Mola aralığı boş bırakılırsa gün boyunca kesintisiz randevu verilir.
        Randevu slotları bu saatlere göre otomatik üretilir.
      </p>

      {state?.error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-danger-soft p-3.5 text-sm font-medium text-danger"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}

      {state?.ok && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl bg-success-soft p-3.5 text-sm font-medium text-success"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          Çalışma saatleri kaydedildi.
        </p>
      )}

      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Save aria-hidden />
          )}
          Kaydet
        </Button>
      </div>
    </form>
  );
}

function TimeInput({
  name,
  label,
  value,
  onChange,
  optional,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  return (
    <input
      type="time"
      name={name}
      aria-label={label}
      value={value}
      required={!optional}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border border-line bg-white px-2.5 text-sm tabular-nums focus:border-brand focus:outline-none"
    />
  );
}
