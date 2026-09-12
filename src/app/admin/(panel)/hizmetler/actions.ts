"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";

const serviceSchema = z.object({
  title: z.string().trim().min(2, "Başlık gerekli.").max(80),
  slug: z.string().trim().max(80),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Kısa açıklama en az 10 karakter olmalı.")
    .max(300),
  icon: z.string().trim().max(40),
  coverImage: z.string().trim().max(300),
  content: z.string().trim().max(20000),
  highlights: z.string().max(2000),
  order: z.coerce.number().int().min(0).max(999),
  published: z.boolean(),
  seoTitle: z.string().trim().max(70, "SEO başlığı 70 karakteri aşmamalı."),
  seoDescription: z
    .string()
    .trim()
    .max(170, "SEO açıklaması 170 karakteri aşmamalı."),
});

export type ServiceState = { ok?: boolean; error?: string; message?: string } | null;

function parse(formData: FormData) {
  return serviceSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    icon: String(formData.get("icon") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    content: String(formData.get("content") ?? ""),
    highlights: String(formData.get("highlights") ?? ""),
    order: formData.get("order") ?? 0,
    published: formData.get("published") === "on",
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  });
}

/** Her satır bir madde — boş satırlar atılır. */
function toHighlights(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function revalidateService(slug: string) {
  revalidatePath("/");
  revalidatePath("/hizmetler");
  revalidatePath(`/hizmetler/${slug}`);
  revalidatePath("/randevu");
  revalidatePath("/admin/hizmetler");
}

export async function saveService(
  id: string | null,
  _prev: ServiceState,
  formData: FormData,
): Promise<ServiceState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const d = parsed.data;

  // Slug boşsa başlıktan üret; çakışıyorsa sonuna numara ekle
  const others = await db.service.findMany({
    where: id ? { NOT: { id } } : {},
    select: { slug: true },
  });

  const slug = uniqueSlug(
    d.slug || d.title,
    others.map((o) => o.slug),
  );

  const data = {
    title: d.title,
    slug,
    shortDescription: d.shortDescription,
    icon: d.icon || null,
    coverImage: d.coverImage || null,
    content: d.content,
    highlights: toHighlights(d.highlights),
    order: d.order,
    published: d.published,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
  };

  try {
    if (id) {
      await db.service.update({ where: { id }, data });
    } else {
      await db.service.create({ data });
    }
  } catch (error) {
    console.error("[admin] hizmet:", error);
    return { error: "Kaydedilemedi." };
  }

  revalidateService(slug);
  return { ok: true, message: id ? "Hizmet güncellendi." : "Hizmet eklendi." };
}

export async function deleteService(id: string) {
  const user = await requireUser();
  if (!user) return { ok: false, message: "Oturum bulunamadı." };
  if (user.role !== "ADMIN") {
    return { ok: false, message: "Bu işlem için yetkiniz yok." };
  }

  const service = await db.service.findUnique({
    where: { id },
    select: { slug: true, _count: { select: { appointments: true } } },
  });

  if (!service) return { ok: false, message: "Hizmet bulunamadı." };

  // Randevusu olan hizmeti silmek geçmişi bozar; yayından kaldırmak yeterli
  if (service._count.appointments > 0) {
    return {
      ok: false,
      message: `Bu hizmete bağlı ${service._count.appointments} randevu var. Silmek yerine yayından kaldırın.`,
    };
  }

  try {
    await db.service.delete({ where: { id } });
  } catch {
    return { ok: false, message: "Silinemedi." };
  }

  revalidateService(service.slug);
  return { ok: true };
}

export async function toggleServicePublished(id: string, published: boolean) {
  const user = await requireUser();
  if (!user) return { ok: false };

  const service = await db.service
    .update({ where: { id }, data: { published }, select: { slug: true } })
    .catch(() => null);

  if (!service) return { ok: false };

  revalidateService(service.slug);
  return { ok: true };
}
