"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/lib/db";

export type PriceState = { ok?: boolean; error?: string; message?: string } | null;

function revalidatePrices() {
  revalidatePath("/");
  revalidatePath("/fiyatlandirma");
  revalidatePath("/admin/fiyatlar");
}

// --- Kategori ---------------------------------------------------------------

const categorySchema = z.object({
  title: z.string().trim().min(2, "Kategori adı gerekli.").max(80),
  note: z.string().trim().max(200),
  order: z.coerce.number().int().min(0).max(999),
});

export async function saveCategory(
  id: string | null,
  _prev: PriceState,
  formData: FormData,
): Promise<PriceState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = categorySchema.safeParse({
    title: String(formData.get("title") ?? ""),
    note: String(formData.get("note") ?? ""),
    order: formData.get("order") ?? 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const data = {
    title: parsed.data.title,
    note: parsed.data.note || null,
    order: parsed.data.order,
  };

  try {
    if (id) await db.priceCategory.update({ where: { id }, data });
    else await db.priceCategory.create({ data });
  } catch (error) {
    console.error("[admin] fiyat kategorisi:", error);
    return { error: "Kaydedilemedi." };
  }

  revalidatePrices();
  return { ok: true, message: id ? "Kategori güncellendi." : "Kategori eklendi." };
}

export async function deleteCategory(id: string) {
  const user = await requireUser();
  if (!user) return { ok: false };

  // Kalemler onDelete: Cascade ile birlikte silinir
  await db.priceCategory.delete({ where: { id } }).catch(() => null);
  revalidatePrices();
  return { ok: true };
}

// --- Kalem ------------------------------------------------------------------

const itemSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(2, "İşlem adı gerekli.").max(120),
  price: z.string().trim().min(1, "Ücret gerekli.").max(60),
  note: z.string().trim().max(200),
  order: z.coerce.number().int().min(0).max(999),
});

export async function saveItem(
  id: string | null,
  _prev: PriceState,
  formData: FormData,
): Promise<PriceState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = itemSchema.safeParse({
    categoryId: String(formData.get("categoryId") ?? ""),
    name: String(formData.get("name") ?? ""),
    price: String(formData.get("price") ?? ""),
    note: String(formData.get("note") ?? ""),
    order: formData.get("order") ?? 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const d = parsed.data;
  const data = {
    categoryId: d.categoryId,
    name: d.name,
    price: d.price,
    note: d.note || null,
    order: d.order,
  };

  try {
    if (id) await db.priceItem.update({ where: { id }, data });
    else await db.priceItem.create({ data });
  } catch (error) {
    console.error("[admin] fiyat kalemi:", error);
    return { error: "Kaydedilemedi." };
  }

  revalidatePrices();
  return { ok: true, message: id ? "Güncellendi." : "İşlem eklendi." };
}

export async function deleteItem(id: string) {
  const user = await requireUser();
  if (!user) return { ok: false };

  await db.priceItem.delete({ where: { id } }).catch(() => null);
  revalidatePrices();
  return { ok: true };
}
