"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/auth";
import { db } from "@/lib/db";

export type UserState = { ok?: boolean; error?: string; message?: string } | null;

const MIN_PASSWORD = 8;

const userSchema = z.object({
  name: z.string().trim().min(2, "İsim gerekli.").max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Geçerli bir e-posta adresi girin.")
    .max(120),
  password: z
    .string()
    .min(MIN_PASSWORD, `Şifre en az ${MIN_PASSWORD} karakter olmalı.`)
    .max(200),
  role: z.enum(["ADMIN", "EDITOR"]),
});

/** Paneli sahipsiz bırakmamak için son yöneticiyi korur. */
async function isLastAdmin(userId: string) {
  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (target?.role !== "ADMIN") return false;

  const adminCount = await db.user.count({ where: { role: "ADMIN" } });
  return adminCount <= 1;
}

export async function createUser(
  _prev: UserState,
  formData: FormData,
): Promise<UserState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Bu işlem için yönetici yetkisi gerekiyor." };

  const parsed = userSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "EDITOR"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  try {
    await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
      },
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return { error: "Bu e-posta adresi zaten kayıtlı." };
    }

    console.error("[admin] kullanıcı ekleme:", error);
    return { error: "Kullanıcı eklenemedi." };
  }

  revalidatePath("/admin/kullanicilar");
  return { ok: true, message: "Kullanıcı eklendi." };
}

export async function updateUserRole(id: string, role: "ADMIN" | "EDITOR") {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Yetkisiz." };

  // Tek yönetici kendini editöre düşürürse panele kimse giremez.
  if (role === "EDITOR" && (await isLastAdmin(id))) {
    return { ok: false, error: "Son yöneticinin yetkisi düşürülemez." };
  }

  await db.user.update({ where: { id }, data: { role } }).catch(() => null);
  revalidatePath("/admin/kullanicilar");
  return { ok: true };
}

export async function deleteUser(id: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Yetkisiz." };

  if (id === admin.id) {
    return { ok: false, error: "Kendi hesabınızı silemezsiniz." };
  }

  if (await isLastAdmin(id)) {
    return { ok: false, error: "Son yönetici silinemez." };
  }

  await db.user.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/kullanicilar");
  return { ok: true };
}

/** Yönetici, unuttuğu şifreyi sıfırlayabilsin diye. */
export async function resetUserPassword(id: string, password: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Yetkisiz." };

  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `Şifre en az ${MIN_PASSWORD} karakter olmalı.` };
  }

  await db.user
    .update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 12) } })
    .catch(() => null);

  return { ok: true };
}
