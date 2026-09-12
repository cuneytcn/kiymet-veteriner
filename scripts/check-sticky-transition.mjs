import { chromium } from "playwright";

/**
 * Sticky geçişi sırasında ara kareleri yakalar.
 * Kenarlık/köşe animasyonundan kaynaklanan sıçramaları görmek için.
 */
const OUT = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1500, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

// Kaydırmayı başlat, geçiş ortasında yakala
await page.evaluate(() => window.scrollTo({ top: 300, behavior: "auto" }));

const frames = [60, 150, 320];
for (const delay of frames) {
  await page.waitForTimeout(delay === 60 ? 60 : 90);

  const box = await page.evaluate(() => {
    const inner = document.querySelector("header > div");
    if (!inner) return null;
    const cs = getComputedStyle(inner);
    const r = inner.getBoundingClientRect();
    return {
      height: Math.round(r.height),
      width: Math.round(r.width),
      radius: cs.borderTopLeftRadius,
      border: cs.borderTopWidth,
      shadow: cs.boxShadow === "none" ? "yok" : "var",
    };
  });

  console.log(
    `+${String(delay).padStart(3)}ms → h:${box.height} w:${box.width} radius:${box.radius} border:${box.border} gölge:${box.shadow}`,
  );

  if (OUT) {
    await page.screenshot({
      path: OUT.replace(".png", `-${delay}.png`),
      clip: { x: 0, y: 0, width: 1500, height: 130 },
    });
  }
}

await browser.close();
