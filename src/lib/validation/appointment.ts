import { z } from "zod";

/** Türkiye cep/sabit hat: 0XXX XXX XX XX veya +90XXXXXXXXXX */
const phoneRegex = /^(?:\+90|0)?\s?5?\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

export const PET_TYPES = [
  { value: "DOG", label: "Köpek" },
  { value: "CAT", label: "Kedi" },
  { value: "BIRD", label: "Kuş" },
  { value: "RABBIT", label: "Tavşan" },
  { value: "HAMSTER", label: "Hamster" },
  { value: "OTHER", label: "Diğer" },
] as const;

export const appointmentSchema = z.object({
  ownerName: z
    .string()
    .trim()
    .min(3, "Ad soyad en az 3 karakter olmalı.")
    .max(80, "Ad soyad çok uzun."),

  phone: z
    .string()
    .trim()
    .min(10, "Telefon numarası eksik.")
    .max(20, "Telefon numarası çok uzun.")
    .regex(phoneRegex, "Geçerli bir telefon numarası girin."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Geçerli bir e-posta adresi girin.")
    .max(120),

  address: z.string().trim().max(200).optional().or(z.literal("")),

  petName: z
    .string()
    .trim()
    .min(1, "Dostunuzun adını girin.")
    .max(50, "İsim çok uzun."),

  petType: z.enum(["DOG", "CAT", "BIRD", "RABBIT", "HAMSTER", "OTHER"], {
    message: "Hayvan türünü seçin.",
  }),

  petBreed: z.string().trim().max(60).optional().or(z.literal("")),
  petAge: z.string().trim().max(30).optional().or(z.literal("")),

  serviceId: z.string().trim().min(1, "Hizmet türünü seçin."),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih seçin."),

  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Saat seçin."),

  notes: z.string().trim().max(1000, "Not çok uzun.").optional().or(z.literal("")),

  consent: z.literal(true, {
    message: "Devam etmek için gizlilik politikasını onaylamalısınız.",
  }),

  /** Bot tuzağı — gerçek kullanıcı bu alanı görmez ve doldurmaz. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

/** Telefonu +905XXXXXXXXX biçimine normalize eder. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return `+90${digits.slice(1)}`;
  if (digits.length === 10) return `+90${digits}`;
  return `+${digits}`;
}
