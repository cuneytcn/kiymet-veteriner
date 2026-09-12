import { chromium } from "playwright";

const [, , url, out, width, full] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width) || 1280, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(url, { waitUntil: "networkidle" });
// Scroll reveal animasyonlarını tetikle
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1200);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(900);

await page.screenshot({ path: out, fullPage: full === "full" });
console.log("saved " + out);
await browser.close();
