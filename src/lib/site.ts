import { cache } from "react";
import type { SiteSetting } from "@prisma/client";
import { db } from "./db";

/**
 * Veritabanı henüz bağlı değilken (ilk kurulum, CI build) sitenin ayakta
 * kalmasını sağlayan varsayılanlar. Gerçek değerler admin panelinden düzenlenir.
 */
export const siteDefaults: SiteSetting = {
  id: "singleton",
  clinicName: "Kıymet Veteriner Kliniği",
  tagline: "Bornova'da 10 yıldır dostlarınızın yanındayız",
  description:
    "İzmir Bornova'da genel muayene, aşı, cerrahi, laboratuvar ve 7/24 acil veteriner hizmetleri.",

  phone: "0232 351 52 53",
  emergencyPhone: "+90 538 694 44 55",
  email: "info@kiymetveteriner.com",
  addressLine: "İnönü Mah. Hürriyet Cd. No:238",
  district: "Bornova",
  city: "İzmir",
  postalCode: "35030",
  latitude: null,
  longitude: null,
  mapsUrl: "",

  instagramUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  xUrl: "",
  whatsappNumber: "+90 538 694 44 55",

  slotDurationMinutes: 30,
  slotCapacity: 1,
  minLeadTimeHours: 2,
  maxAdvanceDays: 60,

  seoTitle: "Kıymet Veteriner Kliniği | Bornova İzmir Veteriner",
  seoDescription:
    "Bornova'da 7/24 acil veteriner hizmeti, genel muayene, aşı, cerrahi ve laboratuvar. Online randevu alın.",
  googleVerification: "",
  updatedAt: new Date(0),
};

export type SiteSettings = SiteSetting;

/**
 * Aynı istek içinde tekrar tekrar sorgulanmasın diye React cache ile sarılı.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await db.siteSetting.findUnique({ where: { id: "singleton" } });
    if (!row) return siteDefaults;
    return { ...siteDefaults, ...row };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[site] Ayarlar okunamadı, varsayılanlar kullanılıyor:",
        (error as Error).message,
      );
    }
    return siteDefaults;
  }
});

/** Şemadaki alanlardan tek satırlık adres üretir. */
export function formatAddress(s: SiteSettings): string {
  return [s.addressLine, `${s.postalCode} ${s.district}`.trim(), s.city]
    .filter(Boolean)
    .join(", ");
}

/** tel: ve wa.me bağlantıları için numarayı sadeleştirir. */
export function toTelHref(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("0")) return `tel:+9${digits}`;
  return `tel:${digits}`;
}

export function toWhatsappHref(raw: string, message?: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0/, "90");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.kiymetveteriner.com";
