import { chromium } from "playwright";

/** Favicon gerçekten yükleniyor mu, sekmede görünür mü? */
const browser = await chromium.launch();
const page = await browser.newPage();

const iconResponses = [];
page.on("response", (r) => {
  if (/icon.*\.png/.test(r.url())) {
    iconResponses.push(`${r.status()} ${r.url().split("/").pop().slice(0, 40)}`);
  }
});

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

const icons = await page.evaluate(() =>
  [...document.querySelectorAll('link[rel*="icon"]')].map((l) => ({
    rel: l.getAttribute("rel"),
    sizes: l.getAttribute("sizes"),
  })),
);

console.log("head etiketleri:");
icons.forEach((i) => console.log(`  ${i.rel} — ${i.sizes}`));
console.log("\nyükleme yanıtları:");
iconResponses.forEach((r) => console.log("  " + r));

await browser.close();
