import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.locator('button[aria-label="Klinik bilgilerini aç"]').click();
await page.waitForTimeout(900);
await page.screenshot({ path: process.argv[2] });
console.log("saved");
await browser.close();
