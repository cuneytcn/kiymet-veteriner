"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";

/**
 * Bu adresler sabit route olarak zaten var; bir sayfa bu slug'ı alırsa
 * asla görünmez. Kullanıcıyı baştan uyarıyoruz.
 */
const RESERVED_SLUGS = [
  "hizmetler",
  "randevu",
  "blog",
  "iletisim",
  "fiyatlandirma",
  "admin",
  "api",
  "sitemap.xml",
  "robots.txt",
];

const pageSchema = z.object({
  title: z.string().trim().min(2, "Başlık gerekli.").max(120),
  slug: z.string().trim().max(80),
  intro: z.string().trim().max(300),
  content: z.string().trim().max(50000),
  published: z.boolean(),
  seoTitle: z.string().trim().max(70, "SEO başlığı 70 karakteri aşmamalı."),
  seoDescription: z
    .string()
    .trim()
    .max(170, "SEO açıklaması 170 karakteri aşmamalı."),
});

export type PageState = { ok?: boolean; error?: string; message?: string } | null;

function revalidatePageBySlug(slug: string) {
  revalidatePath(`/${slug}`);
  revalidatePath("/hakkimizda");
  revalidatePath("/admin/sayfalar");
  revalidatePath("/sitemap.xml");
}

export async function savePage(
  id: string | null,
  _prev: PageState,
  formData: FormData,
): Promise<PageState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = pageSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    intro: String(formData.get("intro") ?? ""),
    content: String(formData.get("content") ?? ""),
    published: formData.get("published") === "on",
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const d = parsed.data;

  const others = await db.page.findMany({
    where: id ? { NOT: { id } } : {},
    select: { slug: true },
  });

  const slug = uniqueSlug(
    d.slug || d.title,
    [...others.map((o) => o.slug), ...RESERVED_SLUGS],
  );

  const data = {
    title: d.title,
    slug,
    intro: d.intro || null,
    content: d.content,
    published: d.published,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
  };

  try {
    if (id) await db.page.update({ where: { id }, data });
    else await db.page.create({ data });
  } catch (error) {
    console.error("[admin] sayfa:", error);
    return { error: "Kaydedilemedi." };
  }

  revalidatePageBySlug(slug);

  const renamed = slug !== d.slug && d.slug.length > 0;
  return {
    ok: true,
    message: renamed
      ? `Kaydedildi. Adres "${slug}" olarak ayarlandı (girdiğiniz adres kullanımdaydı).`
      : id
        ? "Sayfa güncellendi."
        : "Sayfa oluşturuldu.",
  };
}

export async function deletePage(id: string) {
  const user = await requireUser();
  if (!user) return { ok: false, message: "Oturum bulunamadı." };

  const page = await db.page.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!page) return { ok: false, message: "Sayfa bulunamadı." };

  // Footer'dan link verilen yasal sayfalar silinirse bağlantılar kırılır
  if (["kvkk", "gizlilik-politikasi", "kullanim-sartlari"].includes(page.slug)) {
    return {
      ok: false,
      message:
        "Bu sayfaya site altbilgisinden bağlantı veriliyor. Silmek yerine yayından kaldırın.",
    };
  }

  await db.page.delete({ where: { id } }).catch(() => null);
  revalidatePageBySlug(page.slug);
  return { ok: true };
}
