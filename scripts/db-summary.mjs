import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const [services, prices, items, hours, faqs, pages, posts, users, settings] =
  await Promise.all([
    db.service.count(),
    db.priceCategory.count(),
    db.priceItem.count(),
    db.businessHour.count(),
    db.faq.count(),
    db.page.count(),
    db.post.count(),
    db.user.count(),
    db.siteSetting.findUnique({ where: { id: "singleton" } }),
  ]);

console.log("Hizmet:", services);
console.log("Fiyat kategorisi:", prices, "/ kalem:", items);
console.log("Çalışma günü:", hours);
console.log("SSS:", faqs);
console.log("Sayfa:", pages);
console.log("Blog yazısı:", posts);
console.log("Yönetici:", users);
console.log("Klinik adı:", settings?.clinicName);
console.log("Slot süresi:", settings?.slotDurationMinutes, "dk");

await db.$disconnect();
