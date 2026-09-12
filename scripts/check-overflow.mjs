import { chromium } from "playwright";
import { pathToFileURL } from "node:url";

/** Sayfayı gerçekten render edip yatay taşan öğeleri bulur. */
const [, , file] = process.argv;
const browser = await chromium.launch();

for (const width of [1440, 1100, 768, 400]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(pathToFileURL(file).href);
  await page.waitForTimeout(600);

  const problems = await page.evaluate(() => {
    const out = [];
    const docWidth = document.documentElement.clientWidth;

    document.querySelectorAll("*").forEach((el) => {
      const style = getComputedStyle(el);
      if (style.overflowX === "auto" || style.overflowX === "scroll") return;

      // İçeriği kendi kutusundan taşan öğeler
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
        out.push({
          sel: el.className?.toString().slice(0, 44) || el.tagName,
          kind: "içerik taşması",
          scroll: el.scrollWidth,
          client: el.clientWidth,
        });
      }

      // Ekranın sağından taşan öğeler
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1 && rect.width > 0 && rect.width < 4000) {
        out.push({
          sel: el.className?.toString().slice(0, 44) || el.tagName,
          kind: "ekrandan taşma",
          right: Math.round(rect.right),
          doc: docWidth,
        });
      }
    });

    return out.slice(0, 12);
  });

  console.log(`\n### ${width}px — ${problems.length ? problems.length + " sorun" : "temiz"}`);
  problems.forEach((p) => console.log("  ", JSON.stringify(p)));
  await page.close();
}

await browser.close();
