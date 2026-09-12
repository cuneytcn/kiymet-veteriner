"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/lib/db";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const daySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isClosed: z.boolean(),
  openTime: z.string().regex(timeRegex),
  closeTime: z.string().regex(timeRegex),
  breakStart: z.string().regex(timeRegex).or(z.literal("")),
  breakEnd: z.string().regex(timeRegex).or(z.literal("")),
});

export type HoursState = { ok?: boolean; error?: string } | null;

export async function saveBusinessHours(
  _prev: HoursState,
  formData: FormData,
): Promise<HoursState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const days = [];

  for (let d = 0; d <= 6; d++) {
    const parsed = daySchema.safeParse({
      dayOfWeek: d,
      isClosed: formData.get(`closed-${d}`) === "on",
      openTime: String(formData.get(`open-${d}`) ?? ""),
      closeTime: String(formData.get(`close-${d}`) ?? ""),
      breakStart: String(formData.get(`breakStart-${d}`) ?? ""),
      breakEnd: String(formData.get(`breakEnd-${d}`) ?? ""),
    });

    if (!parsed.success) {
      return { error: "Saat biçimi geçersiz. Örnek: 09:00" };
    }

    const day = parsed.data;

    if (!day.isClosed && day.openTime >= day.closeTime) {
      return {
        error: `Kapanış saati açılıştan sonra olmalı (gün ${d + 1}).`,
      };
    }

    if (
      (day.breakStart && !day.breakEnd) ||
      (!day.breakStart && day.breakEnd)
    ) {
      return { error: "Mola için hem başlangıç hem bitiş saati girilmeli." };
    }

    if (day.breakStart && day.breakEnd && day.breakStart >= day.breakEnd) {
      return { error: "Mola bitişi başlangıçtan sonra olmalı." };
    }

    days.push(day);
  }

  try {
    await db.$transaction(
      days.map((day) =>
        db.businessHour.upsert({
          where: { dayOfWeek: day.dayOfWeek },
          update: {
            isClosed: day.isClosed,
            openTime: day.openTime,
            closeTime: day.closeTime,
            breakStart: day.breakStart || null,
            breakEnd: day.breakEnd || null,
          },
          create: {
            dayOfWeek: day.dayOfWeek,
            isClosed: day.isClosed,
            openTime: day.openTime,
            closeTime: day.closeTime,
            breakStart: day.breakStart || null,
            breakEnd: day.breakEnd || null,
          },
        }),
      ),
    );
  } catch (error) {
    console.error("[admin] saatler:", error);
    return { error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }

  // Saatler her yerde görünüyor
  revalidatePath("/", "layout");
  revalidatePath("/admin/saatler");

  return { ok: true };
}
