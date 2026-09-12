import { chromium } from "playwright";

/** Sayfa geçişinde üstteki yükleme çizgisi gerçekten beliriyor mu? */
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const barSelector = 'div[role="presentation"] > div';

const before = await page.locator(barSelector).evaluate((el) => ({
  width: el.style.width,
  opacity: el.style.opacity,
}));
console.log(`tıklamadan önce: genişlik ${before.width || "0%"}, opaklık ${before.opacity}`);

// Menüdeki bir bağlantıya tıkla, hemen ölç
await page.locator('nav a[href="/hakkimizda"]').first().click();
await page.waitForTimeout(180);

const during = await page.locator(barSelector).evaluate((el) => ({
  width: el.style.width,
  opacity: el.style.opacity,
}));
console.log(`geçiş sırasında:  genişlik ${during.width}, opaklık ${during.opacity}`);

await page.waitForURL("**/hakkimizda", { timeout: 15000 });
await page.waitForTimeout(900);

const after = await page.locator(barSelector).evaluate((el) => ({
  width: el.style.width,
  opacity: el.style.opacity,
}));
console.log(`geçişten sonra:   genişlik ${after.width}, opaklık ${after.opacity}`);

const works = during.opacity === "1" && parseFloat(during.width) > 0;
console.log(works ? "\n✓ yükleme çizgisi çalışıyor" : "\n✗ çizgi görünmedi");

await browser.close();
