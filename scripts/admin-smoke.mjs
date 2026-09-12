import "dotenv/config";
import { chromium } from "playwright";

/** Panele giriş yapıp tüm ekranları gezer, hata olup olmadığını raporlar. */
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

const errors = [];
page.on("pageerror", (e) => errors.push(`JS: ${e.message}`));
page.on("response", (r) => {
  if (r.status() >= 400 && !r.url().includes("favicon")) {
    errors.push(`HTTP ${r.status()}: ${r.url().replace(BASE, "")}`);
  }
});

await page.goto(`${BASE}/admin/giris`, { waitUntil: "networkidle" });
await page.fill("#email", process.env.ADMIN_EMAIL);
await page.fill("#password", process.env.ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/admin", { timeout: 20000 });
console.log("✓ giriş başarılı");

const screens = [
  ["/admin", "Panel"],
  ["/admin/randevular", "Randevular"],
  ["/admin/takvim", "Çalışma Takvimi"],
  ["/admin/hizmetler", "Hizmetler"],
  ["/admin/fiyatlar", "Fiyat Listesi"],
  ["/admin/ekip", "Ekip"],
  ["/admin/sss", "Sık Sorulan"],
  ["/admin/blog", "Blog"],
  ["/admin/sayfalar", "Sayfalar"],
  ["/admin/saatler", "Çalışma Saatleri"],
  ["/admin/ayarlar", "Site Ayarları"],
];

for (const [path, expect] of screens) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  const heading = await page.locator("h1").first().textContent();
  const ok = heading?.includes(expect.split(" ")[0]);
  console.log(`${ok ? "✓" : "✗"} ${path} → "${heading?.trim()}"`);
}

// Bir hizmeti açıp formun dolduğunu doğrula
await page.goto(`${BASE}/admin/hizmetler`, { waitUntil: "networkidle" });
await page.locator("a[href^='/admin/hizmetler/']").first().click();
await page.waitForLoadState("networkidle");
const titleValue = await page.locator("#title").inputValue();
console.log(`✓ hizmet düzenleme formu doldu: "${titleValue}"`);

console.log(errors.length ? `\n${errors.length} SORUN:` : "\nHata yok.");
errors.slice(0, 10).forEach((e) => console.log("  " + e));

await browser.close();
