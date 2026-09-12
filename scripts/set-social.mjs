import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const updated = await db.siteSetting.update({
  where: { id: "singleton" },
  data: { instagramUrl: "https://www.instagram.com/kiymetveterinerklinigi" },
  select: { instagramUrl: true, facebookUrl: true, whatsappNumber: true },
});

console.log("Instagram:", updated.instagramUrl);
console.log("Facebook :", updated.facebookUrl || "(boş)");
console.log("WhatsApp :", updated.whatsappNumber);

await db.$disconnect();
