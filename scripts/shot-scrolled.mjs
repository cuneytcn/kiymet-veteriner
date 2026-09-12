import { chromium } from "playwright";

const [, , url, out, width, scrollY] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width) || 1600, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate((y) => window.scrollTo(0, y), Number(scrollY) || 900);
await page.waitForTimeout(1200);

await page.screenshot({
  path: out,
  clip: { x: 0, y: 0, width: Number(width) || 1600, height: 240 },
});

console.log("saved " + out);
await browser.close();
