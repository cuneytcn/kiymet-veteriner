import type { MetadataRoute } from "next";
import { getPosts, getServices } from "@/lib/content";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, posts] = await Promise.all([getServices(), getPosts()]);

  const pages = await db.page
    .findMany({ where: { published: true } })
    .catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/randevu`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/hizmetler`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/fiyatlandirma`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/hakkimizda`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/iletisim`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
  ];

  return [
    ...staticRoutes,
    ...services.map((s) => ({
      url: `${SITE_URL}/hizmetler/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...pages.map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
