import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Instagram gerçek hesap (mevcut siteden alındı).
 * Diğerleri klinik adından türetilmiş TAHMİN — yayına çıkmadan doğrulanmalı.
 */
const updated = await db.siteSetting.update({
  where: { id: "singleton" },
  data: {
    instagramUrl: "https://www.instagram.com/kiymetveterinerklinigi",
    facebookUrl: "https://www.facebook.com/kiymetveterinerklinigi",
    youtubeUrl: "https://www.youtube.com/@kiymetveterinerklinigi",
    tiktokUrl: "https://www.tiktok.com/@kiymetveterinerklinigi",
    xUrl: "https://x.com/kiymetveteriner",
  },
  select: {
    instagramUrl: true,
    facebookUrl: true,
    youtubeUrl: true,
    tiktokUrl: true,
    xUrl: true,
  },
});

Object.entries(updated).forEach(([key, value]) =>
  console.log(`${key.replace("Url", "").padEnd(10)} ${value}`),
);

await db.$disconnect();
