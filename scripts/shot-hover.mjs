import { chromium } from "playwright";
import { pathToFileURL } from "node:url";

const [, , file, selector, out, width] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width) || 1280, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(pathToFileURL(file).href);
await page.waitForTimeout(1600);

const btn = page.locator(selector).first();
await btn.scrollIntoViewIfNeeded();
await btn.hover();
await page.waitForTimeout(900); // dolgu animasyonu bitsin

// Butonun etrafından biraz pay bırakarak kırp
const box = await btn.boundingBox();
await page.screenshot({
  path: out,
  clip: {
    x: Math.max(0, box.x - 24),
    y: Math.max(0, box.y - 24),
    width: box.width + 48,
    height: box.height + 48,
  },
});

console.log("saved " + out);
await browser.close();
