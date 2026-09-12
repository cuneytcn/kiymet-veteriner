"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";

const postSchema = z.object({
  title: z.string().trim().min(3, "Başlık gerekli.").max(160),
  slug: z.string().trim().max(80),
  excerpt: z
    .string()
    .trim()
    .min(20, "Özet en az 20 karakter olmalı.")
    .max(300),
  content: z.string().trim().min(50, "Yazı içeriği çok kısa.").max(50000),
  coverImage: z.string().trim().max(300),
  tags: z.string().max(300),
  published: z.boolean(),
  seoTitle: z.string().trim().max(70, "SEO başlığı 70 karakteri aşmamalı."),
  seoDescription: z
    .string()
    .trim()
    .max(170, "SEO açıklaması 170 karakteri aşmamalı."),
});

export type PostState = { ok?: boolean; error?: string; message?: string } | null;

function revalidatePost(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");
}

export async function savePost(
  id: string | null,
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = postSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    tags: String(formData.get("tags") ?? ""),
    published: formData.get("published") === "on",
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const d = parsed.data;

  const others = await db.post.findMany({
    where: id ? { NOT: { id } } : {},
    select: { slug: true },
  });

  const slug = uniqueSlug(
    d.slug || d.title,
    others.map((o) => o.slug),
  );

  // Yayına ilk alındığında tarih damgası atılır, sonraki kayıtlarda korunur
  const existing = id
    ? await db.post.findUnique({ where: { id }, select: { publishedAt: true } })
    : null;

  const publishedAt = d.published
    ? (existing?.publishedAt ?? new Date())
    : (existing?.publishedAt ?? null);

  const data = {
    title: d.title,
    slug,
    excerpt: d.excerpt,
    content: d.content,
    coverImage: d.coverImage || null,
    tags: d.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10),
    published: d.published,
    publishedAt,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
  };

  try {
    if (id) await db.post.update({ where: { id }, data });
    else await db.post.create({ data });
  } catch (error) {
    console.error("[admin] blog:", error);
    return { error: "Kaydedilemedi." };
  }

  revalidatePost(slug);
  return { ok: true, message: id ? "Yazı güncellendi." : "Yazı oluşturuldu." };
}

export async function deletePost(id: string) {
  const user = await requireUser();
  if (!user) return { ok: false, message: "Oturum bulunamadı." };

  const post = await db.post
    .delete({ where: { id }, select: { slug: true } })
    .catch(() => null);

  if (!post) return { ok: false, message: "Silinemedi." };

  revalidatePost(post.slug);
  return { ok: true };
}
