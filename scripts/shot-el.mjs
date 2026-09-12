import { chromium } from "playwright";

const [, , url, selector, out, width] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width) || 1400, height: 950 },
  deviceScaleFactor: 2,
});

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const el = page.locator(selector).first();
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(500);

const box = await el.boundingBox();
await page.screenshot({
  path: out,
  clip: {
    x: Math.max(0, box.x - 20),
    y: Math.max(0, box.y - 20),
    width: Math.min(box.width + 40, Number(width) || 1400),
    height: box.height + 40,
  },
});

console.log(`saved ${out}  (${Math.round(box.width)}x${Math.round(box.height)})`);
await browser.close();
