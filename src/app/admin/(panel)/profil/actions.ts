"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireUser, signOut } from "@/auth";
import { db } from "@/lib/db";

export type ProfileState = { ok?: boolean; error?: string; message?: string } | null;

/** Şifre alt sınırı. Panel internete açık olduğu için 4 haneli PIN'lere izin vermiyoruz. */
const MIN_PASSWORD = 8;

const profileSchema = z.object({
  name: z.string().trim().min(2, "İsim gerekli.").max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Geçerli bir e-posta adresi girin.")
    .max(120),
});

const passwordSchema = z
  .object({
    current: z.string().min(1, "Mevcut şifrenizi girin."),
    next: z
      .string()
      .min(MIN_PASSWORD, `Yeni şifre en az ${MIN_PASSWORD} karakter olmalı.`)
      .max(200),
    repeat: z.string(),
  })
  .refine((d) => d.next === d.repeat, {
    message: "Yeni şifreler birbiriyle aynı değil.",
    path: ["repeat"],
  });

/** Ad ve e-posta güncellemesi. E-posta değişirse oturum kapatılır. */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const emailChanged = parsed.data.email !== user.email.toLowerCase();

  try {
    await db.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name, email: parsed.data.email },
    });
  } catch (error) {
    // Benzersiz e-posta kısıtı
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return { error: "Bu e-posta adresi başka bir hesapta kullanılıyor." };
    }

    console.error("[admin] profil:", error);
    return { error: "Kaydedilemedi." };
  }

  revalidatePath("/admin/profil");

  // Oturumdaki kimlik eskidiği için yeniden giriş gerekiyor.
  // signOut yönlendirme fırlattığından try bloğunun dışında çağrılıyor.
  if (emailChanged) {
    await signOut({ redirectTo: "/admin/giris" });
  }

  return { ok: true, message: "Bilgileriniz güncellendi." };
}

/** Şifre değişimi. Mevcut şifre doğrulanır, sonra oturum kapatılır. */
export async function changePassword(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = passwordSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    next: String(formData.get("next") ?? ""),
    repeat: String(formData.get("repeat") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!record) return { error: "Hesap bulunamadı." };

  const valid = await bcrypt.compare(parsed.data.current, record.passwordHash);
  if (!valid) return { error: "Mevcut şifreniz hatalı." };

  try {
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(parsed.data.next, 12) },
    });
  } catch (error) {
    console.error("[admin] şifre:", error);
    return { error: "Şifre değiştirilemedi." };
  }

  // Şifre değiştikten sonra yeniden giriş istiyoruz.
  await signOut({ redirectTo: "/admin/giris" });
  return { ok: true };
}
