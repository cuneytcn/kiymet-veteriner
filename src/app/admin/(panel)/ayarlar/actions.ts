"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/lib/db";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => !v || /^https?:\/\//.test(v), {
    message: "Adres http:// veya https:// ile başlamalı.",
  });

const settingsSchema = z.object({
  clinicName: z.string().trim().min(2, "Klinik adı gerekli.").max(120),
  tagline: z.string().trim().max(200),
  description: z.string().trim().max(500),

  phone: z.string().trim().max(30),
  emergencyPhone: z.string().trim().max(30),
  email: z.string().trim().max(120),

  addressLine: z.string().trim().max(200),
  district: z.string().trim().max(60),
  city: z.string().trim().max(60),
  postalCode: z.string().trim().max(10),
  latitude: z.string().trim(),
  longitude: z.string().trim(),
  mapsUrl: optionalUrl,

  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  xUrl: optionalUrl,
  whatsappNumber: z.string().trim().max(30),

  slotDurationMinutes: z.coerce.number().int().min(10).max(120),
  slotCapacity: z.coerce.number().int().min(1).max(10),
  minLeadTimeHours: z.coerce.number().int().min(0).max(72),
  maxAdvanceDays: z.coerce.number().int().min(1).max(365),

  seoTitle: z.string().trim().max(70, "Başlık 70 karakteri aşmamalı."),
  seoDescription: z
    .string()
    .trim()
    .max(170, "Açıklama 170 karakteri aşmamalı."),
  googleVerification: z.string().trim().max(200),
});

export type SettingsState = { ok?: boolean; error?: string } | null;

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const { latitude, longitude, ...rest } = parsed.data;

  const lat = latitude ? Number(latitude) : null;
  const lng = longitude ? Number(longitude) : null;

  if ((lat !== null && Number.isNaN(lat)) || (lng !== null && Number.isNaN(lng))) {
    return { error: "Konum koordinatları sayı olmalı." };
  }

  const data = { ...rest, latitude: lat, longitude: lng };

  try {
    await db.siteSetting.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
  } catch (error) {
    console.error("[admin] ayarlar:", error);
    return { error: "Kaydedilemedi." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar");
  return { ok: true };
}
