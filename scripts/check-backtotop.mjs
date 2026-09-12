import { chromium } from "playwright";

/** Yukarı çık düğmesi doğru zamanda beliriyor ve çalışıyor mu? */
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const btn = page.locator('button[aria-label="Sayfanın başına dön"]');

const atTop = await btn.evaluate((el) => getComputedStyle(el).opacity);
console.log(`sayfa başında     : opaklık ${atTop} ${atTop === "0" ? "(gizli ✓)" : "(GÖRÜNÜR ✗)"}`);

await page.evaluate(() => window.scrollTo(0, 1400));
await page.waitForTimeout(700);
const scrolled = await btn.evaluate((el) => getComputedStyle(el).opacity);
console.log(`kaydırdıktan sonra: opaklık ${scrolled} ${scrolled === "1" ? "(görünür ✓)" : "(GİZLİ ✗)"}`);

await btn.click();
await page.waitForTimeout(1200);
const y = await page.evaluate(() => Math.round(window.scrollY));
console.log(`tıklayınca        : scrollY ${y} ${y < 5 ? "(başa döndü ✓)" : "(DÖNMEDİ ✗)"}`);

// Mobilde alttaki eylem çubuğuyla çakışıyor mu?
const mobile = await browser.newPage({ viewport: { width: 420, height: 800 } });
await mobile.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await mobile.evaluate(() => window.scrollTo(0, 1400));
await mobile.waitForTimeout(700);

const overlap = await mobile.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(
    (el) => el.getAttribute("aria-label") === "Sayfanın başına dön",
  );
  const bar = document.querySelector("div.fixed.inset-x-0.bottom-0");
  if (!b || !bar) return null;
  const r1 = b.getBoundingClientRect();
  const r2 = bar.getBoundingClientRect();
  return { gap: Math.round(r2.top - r1.bottom) };
});

console.log(
  `mobil: eylem çubuğuna mesafe ${overlap?.gap}px ${(overlap?.gap ?? 0) >= 0 ? "(çakışma yok ✓)" : "(ÇAKIŞIYOR ✗)"}`,
);

await browser.close();
