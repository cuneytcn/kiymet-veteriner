import { chromium } from "playwright";

/**
 * Core Web Vitals ölçümü (üretim derlemesi üzerinde anlamlıdır).
 * LCP: en büyük içeriğin boyanma süresi · CLS: düzen kayması · TTFB: ilk bayt
 */
const BASE = process.argv[2] || "http://localhost:3000";
const PAGES = ["/", "/hizmetler", "/randevu", "/blog"];

const browser = await chromium.launch();

for (const path of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto(BASE + path, { waitUntil: "load" });

  const vitals = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const result = { lcp: 0, cls: 0, ttfb: 0, transferKB: 0 };

        const nav = performance.getEntriesByType("navigation")[0];
        if (nav) result.ttfb = Math.round(nav.responseStart);

        result.transferKB = Math.round(
          performance
            .getEntriesByType("resource")
            .reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024,
        );

        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          result.lcp = Math.round(entries[entries.length - 1].startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) result.cls += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });

        setTimeout(() => {
          result.cls = Number(result.cls.toFixed(3));
          resolve(result);
        }, 2500);
      }),
  );

  const lcpOk = vitals.lcp < 2500;
  const clsOk = vitals.cls < 0.1;

  console.log(
    `${path.padEnd(12)} LCP ${String(vitals.lcp).padStart(4)}ms ${lcpOk ? "✓" : "✗"}` +
      `  CLS ${String(vitals.cls).padEnd(5)} ${clsOk ? "✓" : "✗"}` +
      `  TTFB ${String(vitals.ttfb).padStart(3)}ms` +
      `  aktarım ${vitals.transferKB}KB`,
  );

  await page.close();
}

console.log("\nEşikler: LCP < 2500ms, CLS < 0.1 (Google'ın 'iyi' sınırı)");
await browser.close();
