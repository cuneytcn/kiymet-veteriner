import type { BusinessHour, Closure } from "@prisma/client";

export const CLINIC_TIMEZONE = "Europe/Istanbul";

export const DAY_NAMES = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
] as const;

/** Haftayı pazartesiden başlatarak sırala (Türkiye'de alışılmış gösterim). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

// ---------------------------------------------------------------------------
// Saat aritmetiği — "HH:mm" metinleri üzerinde, timezone'dan bağımsız
// ---------------------------------------------------------------------------

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function toTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Klinik yerel zamanı
// ---------------------------------------------------------------------------

type ClinicNow = {
  /** "2026-09-12" */
  date: string;
  /** "14:30" */
  time: string;
  /** 0=Pazar ... 6=Cumartesi */
  dayOfWeek: number;
  minutes: number;
};

/**
 * Sunucu hangi timezone'da çalışırsa çalışsın, kliniğin yerel tarih/saatini verir.
 * Vercel sunucuları UTC olduğu için bu dönüşüm şart.
 */
export function getClinicNow(from: Date = new Date()): ClinicNow {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  }).formatToParts(from);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  // Intl gece yarısını "24" olarak verebiliyor; normalize et.
  const hour = get("hour") === "24" ? "00" : get("hour");
  const time = `${hour}:${get("minute")}`;

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time,
    dayOfWeek: weekdayMap[get("weekday")] ?? 0,
    minutes: toMinutes(time),
  };
}

/** "YYYY-MM-DD" metnini @db.Date sütunuyla eşleşen UTC gece yarısına çevirir. */
export function dateKeyToUtcDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

/** @db.Date sütunundan gelen değeri "YYYY-MM-DD" metnine çevirir. */
export function utcDateToKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" için haftanın gününü verir (takvim aritmetiği, timezone yok). */
export function dayOfWeekForKey(dateKey: string): number {
  return dateKeyToUtcDate(dateKey).getUTCDay();
}

export function addDaysToKey(dateKey: string, days: number): string {
  const d = dateKeyToUtcDate(dateKey);
  d.setUTCDate(d.getUTCDate() + days);
  return utcDateToKey(d);
}

export function formatDateKeyTr(dateKey: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: "UTC",
  }).format(dateKeyToUtcDate(dateKey));
}

// ---------------------------------------------------------------------------
// Günün çalışma aralığı
// ---------------------------------------------------------------------------

export type DayWindow = {
  isClosed: boolean;
  reason?: string;
  openTime?: string;
  closeTime?: string;
  breakStart?: string | null;
  breakEnd?: string | null;
};

/**
 * Bir gün için geçerli çalışma aralığını, tek seferlik kapanışları da hesaba
 * katarak belirler. Closure kaydı haftalık düzeni her zaman ezer.
 */
export function resolveDayWindow(
  dateKey: string,
  hours: BusinessHour[],
  closures: Closure[],
): DayWindow {
  const closure = closures.find((c) => utcDateToKey(c.date) === dateKey);

  if (closure?.allDay) {
    return { isClosed: true, reason: closure.reason ?? undefined };
  }

  const weekly = hours.find((h) => h.dayOfWeek === dayOfWeekForKey(dateKey));

  if (!weekly || weekly.isClosed) {
    return { isClosed: true, reason: weekly ? "Kapalı" : undefined };
  }

  // Kısmi kapanış: gün açık ama saatler daraltılmış
  if (closure && !closure.allDay) {
    return {
      isClosed: false,
      reason: closure.reason ?? undefined,
      openTime: closure.openTime ?? weekly.openTime,
      closeTime: closure.closeTime ?? weekly.closeTime,
      breakStart: weekly.breakStart,
      breakEnd: weekly.breakEnd,
    };
  }

  return {
    isClosed: false,
    openTime: weekly.openTime,
    closeTime: weekly.closeTime,
    breakStart: weekly.breakStart,
    breakEnd: weekly.breakEnd,
  };
}

/** Klinik şu anda açık mı? */
export function isOpenNow(
  hours: BusinessHour[],
  closures: Closure[],
  now: ClinicNow = getClinicNow(),
): boolean {
  const window = resolveDayWindow(now.date, hours, closures);
  if (window.isClosed || !window.openTime || !window.closeTime) return false;

  const open = toMinutes(window.openTime);
  const close = toMinutes(window.closeTime);
  if (now.minutes < open || now.minutes >= close) return false;

  if (window.breakStart && window.breakEnd) {
    const bStart = toMinutes(window.breakStart);
    const bEnd = toMinutes(window.breakEnd);
    if (now.minutes >= bStart && now.minutes < bEnd) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Slot üretimi
// ---------------------------------------------------------------------------

/**
 * Gün içindeki tüm randevu saatlerini üretir. Son slot, kapanıştan en az bir
 * slot süresi önce başlar — kapanışa dakikalar kala randevu verilmesin.
 */
export function generateSlots(
  window: DayWindow,
  slotMinutes: number,
): string[] {
  if (window.isClosed || !window.openTime || !window.closeTime) return [];

  const open = toMinutes(window.openTime);
  const close = toMinutes(window.closeTime);
  const breakStart = window.breakStart ? toMinutes(window.breakStart) : null;
  const breakEnd = window.breakEnd ? toMinutes(window.breakEnd) : null;

  const slots: string[] = [];
  for (let t = open; t + slotMinutes <= close; t += slotMinutes) {
    const overlapsBreak =
      breakStart !== null &&
      breakEnd !== null &&
      t < breakEnd &&
      t + slotMinutes > breakStart;

    if (!overlapsBreak) slots.push(toTimeString(t));
  }

  return slots;
}

/**
 * Bugün için geçmiş saatleri ve hazırlık payını (minLeadTimeHours) eler.
 */
export function filterPastSlots(
  dateKey: string,
  slots: string[],
  minLeadTimeHours: number,
  now: ClinicNow = getClinicNow(),
): string[] {
  if (dateKey > now.date) return slots;
  if (dateKey < now.date) return [];

  const earliest = now.minutes + minLeadTimeHours * 60;
  return slots.filter((s) => toMinutes(s) >= earliest);
}

// ---------------------------------------------------------------------------
// Özet gösterim
// ---------------------------------------------------------------------------

export type HourGroup = {
  label: string;
  value: string;
  days: number[];
};

/**
 * Ardışık günlerde aynı saatleri tek satırda toplar:
 * "Pazartesi – Cuma 09:00 – 21:00" gibi. Yedi satırlık listeyi
 * genelde üçe indirir; dar alanlarda kaydırma gerekmez.
 */
export function groupWeeklyHours(hours: BusinessHour[]): HourGroup[] {
  const groups: HourGroup[] = [];

  for (const day of WEEK_ORDER) {
    const h = hours.find((x) => x.dayOfWeek === day);
    const value =
      !h || h.isClosed ? "Kapalı" : `${h.openTime} – ${h.closeTime}`;

    const last = groups[groups.length - 1];

    if (last && last.value === value) {
      last.days.push(day);
      last.label =
        last.days.length === 2
          ? `${DAY_NAMES[last.days[0]]} – ${DAY_NAMES[day]}`
          : `${DAY_NAMES[last.days[0]]} – ${DAY_NAMES[day]}`;
    } else {
      groups.push({ label: DAY_NAMES[day], value, days: [day] });
    }
  }

  return groups;
}
