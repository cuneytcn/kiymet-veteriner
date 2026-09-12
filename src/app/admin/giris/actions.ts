"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string } | null;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
    return null;
  } catch (error) {
    // signIn başarılı olduğunda yönlendirme için hata fırlatır; onu geçir.
    if (
      error instanceof Error &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    if (error instanceof AuthError) {
      return { error: "E-posta veya şifre hatalı." };
    }

    console.error("[admin] giriş hatası:", error);
    return { error: "Giriş yapılamadı. Lütfen tekrar deneyin." };
  }
}
