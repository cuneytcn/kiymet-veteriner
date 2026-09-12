"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/lib/db";

const faqSchema = z.object({
  question: z.string().trim().min(5, "Soru en az 5 karakter olmalı.").max(200),
  answer: z.string().trim().min(10, "Cevap en az 10 karakter olmalı.").max(2000),
  group: z.enum(["genel", "randevu"]),
  order: z.coerce.number().int().min(0).max(999),
  published: z.boolean(),
});

export type FaqState = { ok?: boolean; error?: string; message?: string } | null;

function revalidateFaq() {
  revalidatePath("/");
  revalidatePath("/randevu");
  revalidatePath("/admin/sss");
}

export async function saveFaq(
  id: string | null,
  _prev: FaqState,
  formData: FormData,
): Promise<FaqState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = faqSchema.safeParse({
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    group: String(formData.get("group") ?? "genel"),
    order: formData.get("order") ?? 0,
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  try {
    if (id) {
      await db.faq.update({ where: { id }, data: parsed.data });
    } else {
      await db.faq.create({ data: parsed.data });
    }
  } catch (error) {
    console.error("[admin] sss:", error);
    return { error: "Kaydedilemedi." };
  }

  revalidateFaq();
  return { ok: true, message: id ? "Soru güncellendi." : "Soru eklendi." };
}

export async function deleteFaq(id: string) {
  const user = await requireUser();
  if (!user) return { ok: false };

  await db.faq.delete({ where: { id } }).catch(() => null);
  revalidateFaq();
  return { ok: true };
}

export async function toggleFaqPublished(id: string, published: boolean) {
  const user = await requireUser();
  if (!user) return { ok: false };

  await db.faq.update({ where: { id }, data: { published } }).catch(() => null);
  revalidateFaq();
  return { ok: true };
}
