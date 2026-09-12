import "server-only";
import { db } from "./db";
import { getSiteSettings } from "./site";
import {
  addDaysToKey,
  dateKeyToUtcDate,
  filterPastSlots,
  generateSlots,
  getClinicNow,
  resolveDayWindow,
  utcDateToKey,
} from "./hours";

export type SlotInfo = {
  time: string;
  available: boolean;
};

export type DayAvailability = {
  date: string;
  isClosed: boolean;
  reason?: string;
  slots: SlotInfo[];
  /** Hiç boş slot kalmadıysa true (gün açık ama dolu). */
  isFull: boolean;
};

/** Slotu bloke eden durumlar — iptal edilmiş randevu yeri açar. */
const BLOCKING_STATUSES = ["PENDING", "CONFIRMED"] as const;

/**
 * Tek bir gün için slot listesi ve doluluk durumu.
 */
export async function getDayAvailability(
  dateKey: string,
): Promise<DayAvailability> {
  const settings = await getSiteSettings();
  const now = getClinicNow();

  // Geçmiş ya da izin verilen aralığın dışı
  const maxDate = addDaysToKey(now.date, settings.maxAdvanceDays);
  if (dateKey < now.date || dateKey > maxDate) {
    return { date: dateKey, isClosed: true, reason: "Bu tarihe randevu alınamıyor.", slots: [], isFull: false };
  }

  const [hours, closures, booked] = await Promise.all([
    db.businessHour.findMany(),
    db.closure.findMany({ where: { date: dateKeyToUtcDate(dateKey) } }),
    db.appointment.groupBy({
      by: ["time"],
      where: {
        date: dateKeyToUtcDate(dateKey),
        status: { in: [...BLOCKING_STATUSES] },
      },
      _count: { _all: true },
    }),
  ]);

  const window = resolveDayWindow(dateKey, hours, closures);
  if (window.isClosed) {
    return {
      date: dateKey,
      isClosed: true,
      reason: window.reason ?? "Bu gün kapalıyız.",
      slots: [],
      isFull: false,
    };
  }

  const all = generateSlots(window, settings.slotDurationMinutes);
  const bookable = filterPastSlots(
    dateKey,
    all,
    settings.minLeadTimeHours,
    now,
  );
  const bookableSet = new Set(bookable);

  const counts = new Map(booked.map((b) => [b.time, b._count._all]));

  const slots: SlotInfo[] = all.map((time) => ({
    time,
    available:
      bookableSet.has(time) &&
      (counts.get(time) ?? 0) < settings.slotCapacity,
  }));

  return {
    date: dateKey,
    isClosed: false,
    reason: window.reason,
    slots,
    isFull: slots.length > 0 && slots.every((s) => !s.available),
  };
}

export type DaySummary = {
  date: string;
  isClosed: boolean;
  isFull: boolean;
  availableCount: number;
};

/**
 * Takvimde gün gün durum. Tek sorguda tüm aralığı çeker; gün başına
 * ayrı sorgu atmaz.
 */
export async function getRangeAvailability(
  fromKey: string,
  days: number,
): Promise<DaySummary[]> {
  const settings = await getSiteSettings();
  const now = getClinicNow();
  const toKey = addDaysToKey(fromKey, days - 1);

  const [hours, closures, booked] = await Promise.all([
    db.businessHour.findMany(),
    db.closure.findMany({
      where: {
        date: { gte: dateKeyToUtcDate(fromKey), lte: dateKeyToUtcDate(toKey) },
      },
    }),
    db.appointment.groupBy({
      by: ["date", "time"],
      where: {
        date: { gte: dateKeyToUtcDate(fromKey), lte: dateKeyToUtcDate(toKey) },
        status: { in: [...BLOCKING_STATUSES] },
      },
      _count: { _all: true },
    }),
  ]);

  // date -> time -> adet
  const countsByDay = new Map<string, Map<string, number>>();
  for (const row of booked) {
    const key = utcDateToKey(row.date);
    const inner = countsByDay.get(key) ?? new Map<string, number>();
    inner.set(row.time, row._count._all);
    countsByDay.set(key, inner);
  }

  const maxDate = addDaysToKey(now.date, settings.maxAdvanceDays);
  const result: DaySummary[] = [];

  for (let i = 0; i < days; i++) {
    const dateKey = addDaysToKey(fromKey, i);

    if (dateKey < now.date || dateKey > maxDate) {
      result.push({ date: dateKey, isClosed: true, isFull: false, availableCount: 0 });
      continue;
    }

    const window = resolveDayWindow(dateKey, hours, closures);
    if (window.isClosed) {
      result.push({ date: dateKey, isClosed: true, isFull: false, availableCount: 0 });
      continue;
    }

    const all = generateSlots(window, settings.slotDurationMinutes);
    const bookable = filterPastSlots(dateKey, all, settings.minLeadTimeHours, now);
    const counts = countsByDay.get(dateKey) ?? new Map<string, number>();

    const availableCount = bookable.filter(
      (t) => (counts.get(t) ?? 0) < settings.slotCapacity,
    ).length;

    result.push({
      date: dateKey,
      isClosed: false,
      isFull: availableCount === 0,
      availableCount,
    });
  }

  return result;
}
