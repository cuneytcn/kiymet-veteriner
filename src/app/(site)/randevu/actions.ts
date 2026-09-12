"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSiteSettings, formatAddress, SITE_URL } from "@/lib/site";
import { getDayAvailability } from "@/lib/appointments";
import { dateKeyToUtcDate } from "@/lib/hours";
import {
  appointmentSchema,
  normalizePhone,
  PET_TYPES,
} from "@/lib/validation/appointment";
import { sendAppointmentEmails } from "@/lib/notify/email";
import { sendWhatsappTemplate } from "@/lib/notify/whatsapp";

export type AppointmentResult =
  | { ok: true; id: string; date: string; time: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Aynı kaynaktan kısa sürede gelen toplu talepleri eler. */
const RATE_WINDOW_MINUTES = 30;
const RATE_MAX_REQUESTS = 3;

async function isRateLimited(phone: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_WINDOW_MINUTES * 60_000);

  const recent = await db.appointment.count({
    where: { phone, createdAt: { gte: since } },
  });

  return recent >= RATE_MAX_REQUESTS;
}

/**
 * useActionState imzası: önceki durum + form verisi.
 */
export async function createAppointment(
  _prevState: AppointmentResult | null,
  formData: FormData,
): Promise<AppointmentResult> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = appointmentSchema.safeParse({
    ...raw,
    consent: raw.consent === "on" || raw.consent === "true",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Lütfen işaretli alanları kontrol edin.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  // Bot tuzağı dolduysa başarılı gibi davran, kaydetme.
  if (data.website) {
    return { ok: true, id: "ignored", date: data.date, time: data.time };
  }

  const phone = normalizePhone(data.phone);

  if (await isRateLimited(phone)) {
    return {
      ok: false,
      message:
        "Kısa süre içinde birden fazla randevu talebi aldık. Lütfen bizi telefonla arayın.",
    };
  }

  // Hizmet gerçekten var mı — form değeri istemciden geliyor.
  const service = await db.service.findFirst({
    where: { id: data.serviceId, published: true },
  });

  if (!service) {
    return {
      ok: false,
      message: "Seçilen hizmet bulunamadı.",
      fieldErrors: { serviceId: "Lütfen listeden bir hizmet seçin." },
    };
  }

  // Slot hâlâ müsait mi? (Form açıkken başkası almış olabilir.)
  const availability = await getDayAvailability(data.date);
  const slot = availability.slots.find((s) => s.time === data.time);

  if (availability.isClosed || !slot?.available) {
    return {
      ok: false,
      message:
        "Seçtiğiniz saat az önce doldu. Lütfen başka bir saat seçin.",
      fieldErrors: { time: "Bu saat artık müsait değil." },
    };
  }

  const settings = await getSiteSettings();

  let appointmentId: string;

  try {
    // Serializable izolasyon: iki eşzamanlı talep aynı slotu alamaz.
    appointmentId = await db.$transaction(
      async (tx) => {
        const taken = await tx.appointment.count({
          where: {
            date: dateKeyToUtcDate(data.date),
            time: data.time,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        });

        if (taken >= settings.slotCapacity) {
          throw new Error("SLOT_TAKEN");
        }

        const created = await tx.appointment.create({
          data: {
            ownerName: data.ownerName,
            phone,
            email: data.email,
            address: data.address || null,
            petName: data.petName,
            petType: data.petType,
            petBreed: data.petBreed || null,
            petAge: data.petAge || null,
            serviceId: service.id,
            serviceLabel: service.title,
            date: dateKeyToUtcDate(data.date),
            time: data.time,
            notes: data.notes || null,
          },
          select: { id: true },
        });

        return created.id;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    const message = (error as Error).message;

    if (message === "SLOT_TAKEN" || message.includes("could not serialize")) {
      return {
        ok: false,
        message: "Seçtiğiniz saat az önce doldu. Lütfen başka bir saat seçin.",
        fieldErrors: { time: "Bu saat artık müsait değil." },
      };
    }

    console.error("[randevu] kayıt hatası:", error);
    return {
      ok: false,
      message:
        "Randevu kaydedilemedi. Lütfen tekrar deneyin veya bizi telefonla arayın.",
    };
  }

  // --- Bildirimler -----------------------------------------------------
  // Randevu kaydedildi; bildirim hatası kullanıcıya hata olarak yansımamalı.
  const petTypeLabel =
    PET_TYPES.find((p) => p.value === data.petType)?.label ?? "Diğer";

  const [emailResult, whatsappResult] = await Promise.all([
    sendAppointmentEmails({
      ownerName: data.ownerName,
      phone,
      email: data.email,
      petName: data.petName,
      petTypeLabel,
      petBreed: data.petBreed,
      petAge: data.petAge,
      serviceLabel: service.title,
      date: data.date,
      time: data.time,
      notes: data.notes,
      address: data.address,
      clinicName: settings.clinicName,
      clinicPhone: settings.phone,
      clinicAddress: formatAddress(settings),
      adminUrl: `${SITE_URL}/admin/randevular/${appointmentId}`,
    }),
    sendWhatsappTemplate({
      to: normalizePhone(settings.whatsappNumber || settings.emergencyPhone),
      params: [
        data.ownerName,
        `${data.date} ${data.time}`,
        service.title,
        phone,
      ],
    }),
  ]);

  if (emailResult.error) console.error("[randevu] e-posta:", emailResult.error);
  if (whatsappResult.error)
    console.error("[randevu] whatsapp:", whatsappResult.error);

  await db.appointment
    .update({
      where: { id: appointmentId },
      data: {
        notifiedEmail: emailResult.ok,
        notifiedWhatsapp: whatsappResult.ok,
      },
    })
    .catch(() => {
      /* bildirim durumu kritik değil */
    });

  revalidatePath("/randevu");
  revalidatePath("/admin/randevular");

  return { ok: true, id: appointmentId, date: data.date, time: data.time };
}

/** Tarih seçildiğinde o günün slotlarını getirir. */
export async function fetchDayAvailability(dateKey: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return { date: dateKey, isClosed: true, slots: [], isFull: false };
  }
  return getDayAvailability(dateKey);
}
