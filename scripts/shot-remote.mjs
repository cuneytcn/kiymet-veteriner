import { chromium } from "playwright";

const [, , url, out, width, clipHeight] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width) || 1600, height: 1000 },
  deviceScaleFactor: 2,
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);

await page.screenshot({
  path: out,
  clip: { x: 0, y: 0, width: Number(width) || 1600, height: Number(clipHeight) || 260 },
});

console.log("saved " + out);
await browser.close();
