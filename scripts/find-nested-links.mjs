import "dotenv/config";
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });

const check = async (path, label) => {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const nested = await page.evaluate(() =>
    [...document.querySelectorAll("a a, button button, a button, button a")].map((el) => {
      const outer = el.closest("a, button");
      return {
        inner: el.tagName + "." + String(el.className).slice(0, 40),
        outerText: outer?.textContent?.trim().slice(0, 40),
      };
    }),
  );
  console.log(`${label.padEnd(18)} ${nested.length ? JSON.stringify(nested) : "temiz ✓"}`);
};

await check("/admin/giris", "/admin/giris");

await page.fill("#email", process.env.ADMIN_EMAIL);
await page.fill("#password", process.env.ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/admin");

for (const p of ["/admin", "/admin/ayarlar", "/admin/randevular"]) await check(p, p);
for (const p of ["/", "/hizmetler", "/blog", "/randevu"]) await check(p, p);

await browser.close();
