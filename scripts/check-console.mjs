import "dotenv/config";
import { chromium } from "playwright";

/** Sayfalardaki konsol hatalarını ve uyarılarını toplar. */
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });

const found = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") {
    found.push(`[${m.type()}] ${m.text().slice(0, 700)}`);
  }
});
page.on("pageerror", (e) => found.push(`[pageerror] ${e.message.slice(0, 700)}`));

await page.goto(`${BASE}/admin/giris`, { waitUntil: "networkidle" });
await page.fill("#email", process.env.ADMIN_EMAIL);
await page.fill("#password", process.env.ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/admin");
await page.waitForTimeout(1500);

for (const path of ["/admin", "/admin/randevular", "/admin/ekip", "/"]) {
  found.push(`--- ${path} ---`);
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
}

const unique = [...new Set(found)];
unique.forEach((f) => console.log(f));
console.log(`\n${unique.filter((f) => !f.startsWith("---")).length} benzersiz sorun`);

await browser.close();
