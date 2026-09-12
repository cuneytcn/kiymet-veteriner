import { chromium } from "playwright";
import { pathToFileURL } from "node:url";

const [, , file, selector, out, width] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width) || 1280, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(pathToFileURL(file).href);
await page.waitForTimeout(800);

const target = selector === "page" ? page : page.locator(selector).first();
if (selector !== "page") await target.scrollIntoViewIfNeeded();
await page.waitForTimeout(1600);

await target.screenshot({ path: out });
console.log("saved " + out);
await browser.close();
