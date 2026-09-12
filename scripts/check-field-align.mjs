import "dotenv/config";
import { chromium } from "playwright";

/** Yan yana duran form alanlarının girdileri aynı hizada mı? */
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });

await page.goto("http://localhost:3000/admin/giris", { waitUntil: "networkidle" });
await page.fill("#email", process.env.ADMIN_EMAIL);
await page.fill("#password", process.env.ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/admin");

await page.goto("http://localhost:3000/admin/ayarlar", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const rows = await page.evaluate(() => {
  const inputs = [...document.querySelectorAll("input, textarea")].filter(
    (el) => el.offsetParent !== null,
  );

  // Aynı satırdaki girdileri grupla (üst koordinatı 40px içinde olanlar)
  const groups = [];
  for (const el of inputs) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const g = groups.find((x) => Math.abs(x.top - top) < 40);
    if (g) g.items.push({ id: el.id, top: Math.round(top) });
    else groups.push({ top, items: [{ id: el.id, top: Math.round(top) }] });
  }

  return groups
    .filter((g) => g.items.length > 1)
    .map((g) => ({
      ids: g.items.map((i) => i.id),
      spread: Math.max(...g.items.map((i) => i.top)) - Math.min(...g.items.map((i) => i.top)),
    }));
});

let bad = 0;
rows.forEach((r) => {
  if (r.spread > 1) {
    bad++;
    console.log(`✗ ${r.ids.join(" / ")} → ${r.spread}px kayma`);
  }
});

console.log(
  bad ? `\n${bad} satırda kayma var.` : `\n${rows.length} satırın hepsi hizalı ✓`,
);

await browser.close();
