import "dotenv/config";
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const OUT_DIR = process.argv[2];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });

await page.goto(`${BASE}/admin/giris`, { waitUntil: "networkidle" });
await page.fill("#email", process.env.ADMIN_EMAIL);
await page.fill("#password", process.env.ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/admin");

const screens = [["/admin/ayarlar", "ayarlar"], ["/admin", "panel"]];

for (const [path, name] of screens) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT_DIR}/admin-${name}.png`, fullPage: false });
  console.log(`admin-${name}.png`);
}

await browser.close();
