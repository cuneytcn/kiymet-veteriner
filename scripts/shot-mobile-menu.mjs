import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 430, height: 860 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.locator('button[aria-label="Menüyü aç"]').click();
await page.waitForTimeout(600);
await page.screenshot({ path: process.argv[2], clip: { x: 0, y: 0, width: 430, height: 260 } });
console.log("saved");
await browser.close();
