"use client";

import { useMemo } from "react";
import type { DaySummary } from "@/lib/appointments";
import { DAY_NAMES, dateKeyToUtcDate } from "@/lib/hours";
import { cn } from "@/lib/utils";

/**
 * Gün seçici. Yatay kaydırma yerine ızgara: alana kaç gün sığıyorsa o kadar
 * sütun açılır, kalanlar alt satıra iner. Böylece hiçbir gün kesilmez ve
 * ziyaretçi tüm müsaitliği tek bakışta görür.
 */
export function DateStrip({
  days,
  selected,
  onSelect,
}: {
  days: DaySummary[];
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const items = useMemo(
    () =>
      days.map((d) => {
        const utc = dateKeyToUtcDate(d.date);
        return {
          ...d,
          dayName: DAY_NAMES[utc.getUTCDay()].slice(0, 3),
          dayNumber: utc.getUTCDate(),
          monthName: new Intl.DateTimeFormat("tr-TR", {
            month: "short",
            timeZone: "UTC",
          }).format(utc),
          fullLabel: new Intl.DateTimeFormat("tr-TR", {
            day: "numeric",
            month: "long",
            weekday: "long",
            timeZone: "UTC",
          }).format(utc),
        };
      }),
    [days],
  );

  return (
    <div className="min-w-0">
      <p className="mb-3 text-sm font-semibold text-navy">Tarih seçin</p>

      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-2"
        role="radiogroup"
        aria-label="Randevu tarihi"
      >
        {items.map((day) => {
          const disabled = day.isClosed || day.isFull;
          const isSelected = selected === day.date;

          return (
            <button
              key={day.date}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${day.fullLabel} — ${
                day.isClosed
                  ? "kapalı"
                  : day.isFull
                    ? "dolu"
                    : `${day.availableCount} saat müsait`
              }`}
              disabled={disabled}
              onClick={() => onSelect(day.date)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl border-2 px-1 py-2.5 transition-colors",
                isSelected
                  ? "border-brand bg-brand text-white"
                  : disabled
                    ? "cursor-not-allowed border-line bg-cream text-muted/60"
                    : "border-line bg-white text-navy hover:border-brand",
              )}
            >
              <span
                className={cn(
                  "text-[0.6875rem] font-medium",
                  isSelected ? "text-white/80" : "text-muted",
                )}
              >
                {day.dayName}
              </span>

              <span className="font-head text-lg leading-tight font-bold tabular-nums">
                {day.dayNumber}
              </span>

              <span
                className={cn(
                  "text-[0.625rem] leading-none",
                  isSelected ? "text-white/80" : "text-muted",
                )}
              >
                {day.monthName}
              </span>

              <span className="mt-1 text-[0.625rem] leading-none font-semibold">
                {day.isClosed ? (
                  <span className={isSelected ? "text-white/80" : "text-muted"}>
                    Kapalı
                  </span>
                ) : day.isFull ? (
                  <span className={isSelected ? "text-white/80" : "text-muted"}>
                    Dolu
                  </span>
                ) : (
                  <span className={isSelected ? "text-sun" : "text-leaf-dark"}>
                    {day.availableCount} saat
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
