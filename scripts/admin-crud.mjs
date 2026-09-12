import "dotenv/config";
import { chromium } from "playwright";

/** Panelde bir hizmeti düzenleyip kaydeder, sonucun kalıcı olduğunu doğrular. */
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

page.on("console", (m) => {
  if (m.type() === "error") console.log("  konsol hatası:", m.text().slice(0, 200));
});
page.on("pageerror", (e) => console.log("  JS hatası:", e.message.slice(0, 200)));

await page.goto(`${BASE}/admin/giris`, { waitUntil: "networkidle" });
await page.fill("#email", process.env.ADMIN_EMAIL);
await page.fill("#password", process.env.ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/admin");

await page.goto(`${BASE}/admin/hizmetler`, { waitUntil: "networkidle" });
const editLink = page.locator("ul a[href^='/admin/hizmetler/']").first();
const href = await editLink.getAttribute("href");
await editLink.click();
await page.waitForLoadState("networkidle");

console.log(`açıldı: ${href}`);
console.log(`  başlık: "${await page.locator("#title").inputValue()}"`);

const original = await page.locator("#order").inputValue();
await page.locator("#order").fill("42");
await page.click('main form button[type="submit"]');
await page.waitForTimeout(6000);

const statusCount = await page.locator('[role="status"]').count();
const alertCount = await page.locator('[role="alert"]').count();
console.log(`  status: ${statusCount}, alert: ${alertCount}`);

if (alertCount) {
  console.log("  HATA:", (await page.locator('[role="alert"]').first().textContent())?.trim());
}
if (statusCount) {
  console.log("  mesaj:", (await page.locator('[role="status"]').first().textContent())?.trim());
}

await page.reload({ waitUntil: "networkidle" });
const after = await page.locator("#order").inputValue();
console.log(`  kalıcılık: ${original} -> ${after} ${after === "42" ? "(KAYDEDİLDİ)" : "(KAYDEDİLMEDİ)"}`);

// Eski haline döndür
if (after === "42") {
  await page.locator("#order").fill(original);
  await page.click('main form button[type="submit"]');
  await page.waitForTimeout(4000);
  console.log(`  geri alındı: ${original}`);
}

await browser.close();
