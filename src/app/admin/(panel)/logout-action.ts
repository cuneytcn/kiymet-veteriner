"use server";

import { signOut } from "@/auth";

/**
 * Çıkış işlemi server action ile yapılır.
 * Doğrudan /api/auth/signout adresine POST atmak CSRF doğrulamasına takılıyor.
 */
export async function logout() {
  await signOut({ redirectTo: "/admin/giris" });
}
