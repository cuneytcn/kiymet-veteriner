import { chromium } from "playwright";

/** Mobil menü, başlığın tam altından mı başlıyor? */
const browser = await chromium.launch();

for (const scrollY of [0, 800]) {
  const page = await browser.newPage({ viewport: { width: 430, height: 860 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(700);

  await page.locator('button[aria-label="Menüyü aç"]').click();
  await page.waitForTimeout(500);

  const m = await page.evaluate(() => {
    const header = document.querySelector("header > div");
    const menu = document.querySelector("header ~ div, header div.fixed.inset-x-0.bottom-0");
    const panel = [...document.querySelectorAll("div")].find(
      (d) => d.className.includes("fixed") && d.className.includes("bottom-0") && d.querySelector("nav[aria-label='Mobil menü']"),
    );
    if (!header || !panel) return null;
    const h = header.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    return { headerBottom: Math.round(h.bottom), menuTop: Math.round(p.top) };
  });

  const gap = m ? m.menuTop - m.headerBottom : null;
  console.log(
    `scroll ${String(scrollY).padStart(3)}px → başlık alt: ${m?.headerBottom}px, menü üst: ${m?.menuTop}px, fark: ${gap}px ${gap === 0 ? "✓" : "← HİZASIZ"}`,
  );

  await page.close();
}

await browser.close();
