import { chromium } from "playwright";

/**
 * Buton ve buton görünümlü bağlantılarda ikonun metnin üstüne kaymasını arar.
 * Belirti: eleman yüksekliği, tek satırlık bir butondan belirgin şekilde fazla.
 */
const BASE = "http://localhost:3000";
const PAGES = [
  "/",
  "/hizmetler",
  "/hizmetler/genel-muayene",
  "/fiyatlandirma",
  "/hakkimizda",
  "/iletisim",
  "/blog",
  "/blog/kedilerde-asi-takvimi",
  "/randevu",
  "/kvkk",
];

const browser = await chromium.launch();
let problems = 0;

for (const path of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const bad = await page.evaluate(() => {
    const out = [];
    const nodes = document.querySelectorAll(
      "a, button, .rounded-pill",
    );

    nodes.forEach((el) => {
      const svg = el.querySelector("svg");
      const text = el.textContent?.trim() ?? "";
      if (!svg || !text) return;

      const rect = el.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) return;

      // İkon ile metin aynı satırdaysa ikonun merkezi butonun dikey ortasına yakın olur
      const svgRect = svg.getBoundingClientRect();
      const svgCenter = svgRect.top + svgRect.height / 2;
      const elCenter = rect.top + rect.height / 2;
      const offset = Math.abs(svgCenter - elCenter);

      // Yalnızca buton görünümlü öğeler: pill/yuvarlak kenarlı ve tek satırlık
      const cls = el.className?.toString() ?? "";
      const isButton =
        el.tagName === "BUTTON" ||
        cls.includes("rounded-pill") ||
        cls.includes("btn");

      if (isButton && offset > 4 && rect.height < 96) {
        out.push({
          text: text.slice(0, 32),
          height: Math.round(rect.height),
          iconOffset: Math.round(offset),
        });
      }
    });

    return out;
  });

  if (bad.length) {
    problems += bad.length;
    console.log(`\n${path} — ${bad.length} şüpheli:`);
    bad.slice(0, 5).forEach((b) =>
      console.log(`   "${b.text}" h=${b.height}px ikon sapması=${b.iconOffset}px`),
    );
  } else {
    console.log(`${path} — temiz`);
  }

  await page.close();
}

console.log(problems ? `\nToplam ${problems} şüpheli.` : "\nTüm sayfalar temiz.");
await browser.close();
