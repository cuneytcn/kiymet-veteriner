import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 300 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

// Geçişi başlat ve çizgi yarı yoldayken yakala
await page.evaluate(() => {
  document.querySelector('nav a[href="/hakkimizda"]')?.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
});
await page.waitForTimeout(260);

await page.screenshot({ path: process.argv[2], clip: { x: 0, y: 0, width: 1400, height: 90 } });
console.log("saved");
await browser.close();
