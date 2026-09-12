import "dotenv/config";
import { chromium } from "playwright";

/** Çıkış butonunun gerçekten oturumu kapattığını doğrular. */
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

await page.goto(`${BASE}/admin/giris`, { waitUntil: "networkidle" });
await page.fill("#email", process.env.ADMIN_EMAIL);
await page.fill("#password", process.env.ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/admin");
console.log("giriş: ✓");

// Sidebar'daki çıkış butonu
await page.click('aside form button[type="submit"]');
await page.waitForURL("**/admin/giris**", { timeout: 15000 });
console.log(`çıkış: ✓ → ${page.url().replace(BASE, "")}`);

// Oturum gerçekten kapandı mı? Panele girmeye çalış
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
const redirected = page.url().includes("/admin/giris");
console.log(`oturum kapandı mı: ${redirected ? "✓ evet" : "✗ HAYIR — hâlâ girişli"}`);

await browser.close();
