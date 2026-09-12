import "dotenv/config";
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/** Toast bildiriminin gerçekten göründüğünü ve okunabildiğini doğrular. */
const BASE = "http://localhost:3000";
const OUT = process.argv[2];

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

// --- Panelde kaydetme toast'ı ---------------------------------------------
await page.goto(`${BASE}/admin/giris`, { waitUntil: "networkidle" });
await page.fill("#email", process.env.ADMIN_EMAIL);
await page.fill("#password", process.env.ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/admin");

await page.goto(`${BASE}/admin/hizmetler`, { waitUntil: "networkidle" });
await page.locator("ul a[href^='/admin/hizmetler/']").first().click();
await page.waitForLoadState("networkidle");

const order = await page.locator("#order").inputValue();
await page.locator("#order").fill(order); // değeri değiştirmeden kaydet
await page.click('main form button[type="submit"]');

// Toast'ı yakala
await page.waitForSelector('[role="status"], [role="alert"]', { timeout: 15000 });
await page.waitForTimeout(700);

const toast = page.locator('[role="status"]').last();
const text = (await toast.textContent())?.trim();
console.log(`panel toast: "${text}"`);

if (OUT) {
  const box = await toast.boundingBox();
  if (box) {
    await page.screenshot({
      path: OUT,
      clip: {
        x: Math.max(0, box.x - 24),
        y: Math.max(0, box.y - 24),
        width: box.width + 48,
        height: box.height + 48,
      },
    });
    console.log(`görüntü: ${OUT}`);
  }
}

// --- Ziyaretçi tarafı: randevu toast'ı ------------------------------------
await page.goto(`${BASE}/randevu`, { waitUntil: "networkidle" });
await page.locator('[role="radio"][aria-checked="false"]:not([disabled])').first().click();
await page.waitForTimeout(1800);
await page
  .locator('div[role="radiogroup"][aria-label*="saatleri"] button:not([disabled])')
  .first()
  .click();

await page.fill("#petName", "Toast Test");
await page.selectOption("#petType", "DOG");
await page.selectOption("#serviceId", { index: 1 });
await page.fill("#ownerName", "Toast Deneme");
await page.fill("#phone", "0555 000 33 44");
await page.fill("#email", process.env.NOTIFY_TO_EMAIL);
await page.check('input[name="consent"]');
await page.click('button[type="submit"]');

await page.waitForSelector('[role="status"]', { timeout: 20000 });
await page.waitForTimeout(600);
const siteToast = await page
  .locator('[role="status"]')
  .last()
  .textContent()
  .catch(() => null);

console.log(`site toast: "${siteToast?.trim() ?? "(görünmedi)"}"`);

if (OUT && siteToast) {
  const b = await page.locator('[role="status"]').last().boundingBox();
  if (b) {
    await page.screenshot({
      path: OUT.replace(".png", "-site.png"),
      clip: { x: Math.max(0, b.x - 24), y: Math.max(0, b.y - 24), width: b.width + 48, height: b.height + 48 },
    });
    console.log(`görüntü: ${OUT.replace(".png", "-site.png")}`);
  }
}

// Temizlik
const deleted = await db.appointment.deleteMany({
  where: { phone: { contains: "5550003344" } },
});
console.log(`temizlik: ${deleted.count} test kaydı silindi`);

await browser.close();
await db.$disconnect();
