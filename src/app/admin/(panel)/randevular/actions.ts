"use server";

import { revalidatePath } from "next/cache";
import type { AppointmentStatus } from "@prisma/client";
import { requireUser } from "@/auth";
import { db } from "@/lib/db";

const VALID_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export type ActionResult = { ok: boolean; message?: string };

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, message: "Oturum bulunamadı." };

  if (!VALID_STATUSES.includes(status)) {
    return { ok: false, message: "Geçersiz durum." };
  }

  try {
    await db.appointment.update({ where: { id }, data: { status } });
  } catch {
    return { ok: false, message: "Randevu güncellenemedi." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/randevular");
  revalidatePath(`/admin/randevular/${id}`);
  // Slot yeniden açılmış olabilir
  revalidatePath("/randevu");

  return { ok: true };
}

export async function updateAdminNote(
  id: string,
  note: string,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, message: "Oturum bulunamadı." };

  try {
    await db.appointment.update({
      where: { id },
      data: { adminNote: note.trim().slice(0, 2000) || null },
    });
  } catch {
    return { ok: false, message: "Not kaydedilemedi." };
  }

  revalidatePath(`/admin/randevular/${id}`);
  return { ok: true };
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, message: "Oturum bulunamadı." };
  if (user.role !== "ADMIN") {
    return { ok: false, message: "Bu işlem için yetkiniz yok." };
  }

  try {
    await db.appointment.delete({ where: { id } });
  } catch {
    return { ok: false, message: "Randevu silinemedi." };
  }

  revalidatePath("/admin/randevular");
  revalidatePath("/randevu");
  return { ok: true };
}
