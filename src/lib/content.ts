import { cache } from "react";
import type {
  BusinessHour,
  Closure,
  Faq,
  Page,
  Post,
  PriceCategory,
  PriceItem,
  Service,
  TeamMember,
} from "@prisma/client";
import { db } from "./db";

/**
 * Veritabanı erişilemediğinde site çökmesin: uyar ve boş sonuç dön.
 * Böylece DATABASE_URL bağlanmadan da arayüz geliştirilebilir.
 */
async function safe<T>(label: string, fn: () => Promise<T>, fallback: T) {
  try {
    return await fn();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[content] ${label} okunamadı:`, (error as Error).message);
    }
    return fallback;
  }
}

export const getServices = cache(async (): Promise<Service[]> =>
  safe(
    "hizmetler",
    () =>
      db.service.findMany({
        where: { published: true },
        orderBy: [{ order: "asc" }, { title: "asc" }],
      }),
    [],
  ),
);

export const getServiceBySlug = cache(async (slug: string) =>
  safe(
    `hizmet:${slug}`,
    () => db.service.findFirst({ where: { slug, published: true } }),
    null,
  ),
);

export const getBusinessHours = cache(async (): Promise<BusinessHour[]> =>
  safe(
    "çalışma saatleri",
    () => db.businessHour.findMany({ orderBy: { dayOfWeek: "asc" } }),
    [],
  ),
);

/** Bugünden itibaren ileriye dönük kapanışlar (geçmiş tatiller gereksiz). */
export const getUpcomingClosures = cache(async (): Promise<Closure[]> =>
  safe(
    "kapanışlar",
    () => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      return db.closure.findMany({
        where: { date: { gte: today } },
        orderBy: { date: "asc" },
      });
    },
    [],
  ),
);

export type PriceCategoryWithItems = PriceCategory & { items: PriceItem[] };

export const getPriceCategories = cache(
  async (): Promise<PriceCategoryWithItems[]> =>
    safe(
      "fiyatlar",
      () =>
        db.priceCategory.findMany({
          orderBy: { order: "asc" },
          include: { items: { orderBy: { order: "asc" } } },
        }),
      [],
    ),
);

export const getTeam = cache(async (): Promise<TeamMember[]> =>
  safe(
    "ekip",
    () =>
      db.teamMember.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
    [],
  ),
);

export const getFaqs = cache(async (group?: string): Promise<Faq[]> =>
  safe(
    "sss",
    () =>
      db.faq.findMany({
        where: { published: true, ...(group ? { group } : {}) },
        orderBy: { order: "asc" },
      }),
    [],
  ),
);

export const getPosts = cache(async (limit?: number): Promise<Post[]> =>
  safe(
    "yazılar",
    () =>
      db.post.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        ...(limit ? { take: limit } : {}),
      }),
    [],
  ),
);

export const getPostBySlug = cache(async (slug: string) =>
  safe(
    `yazı:${slug}`,
    () => db.post.findFirst({ where: { slug, published: true } }),
    null,
  ),
);

export const getPage = cache(async (slug: string): Promise<Page | null> =>
  safe(
    `sayfa:${slug}`,
    () => db.page.findFirst({ where: { slug, published: true } }),
    null,
  ),
);
