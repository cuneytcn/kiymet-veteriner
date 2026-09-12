"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/lib/db";
import { dateKeyToUtcDate } from "@/lib/hours";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const closureSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih seçin."),
    reason: z.string().trim().max(120).optional().or(z.literal("")),
    allDay: z.boolean(),
    openTime: z.string().regex(timeRegex).or(z.literal("")),
    closeTime: z.string().regex(timeRegex).or(z.literal("")),
  })
  .refine((d) => d.allDay || (d.openTime && d.closeTime), {
    message: "Kısmi kapanışta açılış ve kapanış saati gerekli.",
    path: ["openTime"],
  })
  .refine((d) => d.allDay || d.openTime < d.closeTime, {
    message: "Kapanış saati açılıştan sonra olmalı.",
    path: ["closeTime"],
  });

export type ClosureState = { ok?: boolean; error?: string } | null;

export async function addClosure(
  _prev: ClosureState,
  formData: FormData,
): Promise<ClosureState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = closureSchema.safeParse({
    date: String(formData.get("date") ?? ""),
    reason: String(formData.get("reason") ?? ""),
    allDay: formData.get("allDay") === "on",
    openTime: String(formData.get("openTime") ?? ""),
    closeTime: String(formData.get("closeTime") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const d = parsed.data;

  try {
    await db.closure.upsert({
      where: { date: dateKeyToUtcDate(d.date) },
      update: {
        reason: d.reason || null,
        allDay: d.allDay,
        openTime: d.allDay ? null : d.openTime,
        closeTime: d.allDay ? null : d.closeTime,
      },
      create: {
        date: dateKeyToUtcDate(d.date),
        reason: d.reason || null,
        allDay: d.allDay,
        openTime: d.allDay ? null : d.openTime,
        closeTime: d.allDay ? null : d.closeTime,
      },
    });
  } catch (error) {
    console.error("[admin] kapanış:", error);
    return { error: "Kaydedilemedi." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/takvim");
  return { ok: true };
}

export async function removeClosure(id: string) {
  const user = await requireUser();
  if (!user) return { ok: false };

  await db.closure.delete({ where: { id } }).catch(() => null);

  revalidatePath("/", "layout");
  revalidatePath("/admin/takvim");
  return { ok: true };
}
