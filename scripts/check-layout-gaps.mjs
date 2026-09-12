import { chromium } from "playwright";

/**
 * Sayfanın üstünde/altında beklenmeyen boşluk var mı?
 * -mt-38 gibi negatif kenar boşlukları düzeni kaydırabiliyor.
 */
const BASE = "http://localhost:3000";
const PAGES = ["/", "/hizmetler", "/randevu", "/blog", "/kvkk", "/olmayan-sayfa"];

const WIDTH = Number(process.argv[2]) || 1400;
const browser = await chromium.launch();

console.log(`--- ${WIDTH}px ---`);
for (const path of PAGES) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const m = await page.evaluate(() => {
    const header = document.querySelector("header");
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    const firstInMain = main?.firstElementChild;

    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height) };
    };

    return {
      header: r(header),
      main: r(main),
      firstInMain: r(firstInMain),
      footer: r(footer),
      docHeight: Math.round(document.documentElement.scrollHeight),
      bodyTop: Math.round(document.body.getBoundingClientRect().top),
      // Başlığın üstünde boyanmamış alan var mı?
      aboveHeader: Math.round(header?.getBoundingClientRect().top ?? 0),
    };
  });

  const gapAfterFooter = m.docHeight - (m.footer ? m.footer.bottom : 0);

  console.log(`\n${path}`);
  console.log(`  üst şerit yüksekliği: ${m.aboveHeader}px`);
  console.log(`  başlık             : top ${m.header.top}, yükseklik ${m.header.h}`);
  console.log(`  main ilk öğe        : top ${m.firstInMain?.top}px ${(m.firstInMain?.top ?? 0) > 1 && (m.firstInMain?.top ?? 0) < 140 ? "← BOŞLUK" : ""}`);
  console.log(`  footer sonu → belge: ${gapAfterFooter}px ${gapAfterFooter > 1 ? "← SORUN" : ""}`);

  await page.close();
}

await browser.close();
