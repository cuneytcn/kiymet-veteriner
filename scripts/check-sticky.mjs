import { chromium } from "playwright";

/** Sayfa kaydırıldığında başlığın ekranın üstünde kalıp kalmadığını ölçer. */
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

for (const y of [0, 300, 1200, 2500]) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(700);

  const info = await page.evaluate(() => {
    const header = document.querySelector("header");
    if (!header) return null;
    const r = header.getBoundingClientRect();
    return {
      top: Math.round(r.top),
      visible: r.bottom > 0 && r.top < window.innerHeight,
      position: getComputedStyle(header).position,
    };
  });

  console.log(
    `scroll ${String(y).padStart(4)}px → header top: ${String(info.top).padStart(6)}px  ${
      info.visible ? "görünür" : "EKRANDA DEĞİL"
    }  (${info.position})`,
  );
}

await browser.close();
