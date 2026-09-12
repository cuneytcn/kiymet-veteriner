import { chromium } from "playwright";
import sharp from "sharp";

/**
 * Başlığın arkasındaki zemin, hemen altındaki bölümün zeminiyle aynı mı?
 * Farklıysa başlık kutusunun altında sert bir renk çizgisi oluşur.
 *
 * Ölçüm ekran görüntüsündeki gerçek piksellerden yapılır: DOM üzerinden
 * bakmak yanıltıyor, çünkü o noktada en üstte başlığın kendisi duruyor.
 */
const BASE = "http://localhost:3000";
const PAGES = [
  "/",
  "/hizmetler",
  "/hizmetler/genel-muayene",
  "/hakkimizda",
  "/fiyatlandirma",
  "/iletisim",
  "/blog",
  "/randevu",
  "/kvkk",
];

const browser = await chromium.launch();
let problems = 0;

for (const path of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const rect = await page.evaluate(() => {
    const r = document.querySelector("header").getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, height: r.height };
  });

  const shot = await page.screenshot({ clip: { x: 0, y: 0, width: 60, height: rect.bottom + 60 } });
  const { data, info } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });

  const pixel = (x, y) => {
    const i = (Math.round(y) * info.width + Math.round(x)) * info.channels;
    return [data[i], data[i + 1], data[i + 2]];
  };

  // Kutunun solundaki şerit (başlığın arkasına denk gelir) ve başlığın hemen altı
  const beside = pixel(20, rect.top + rect.height / 2);
  const below = pixel(20, rect.bottom + 30);

  // Küçük gradyan farkları normal; 12 birimden fazlası göze çarpar
  const diff = Math.max(...beside.map((v, i) => Math.abs(v - below[i])));
  const ok = diff <= 12;
  if (!ok) problems++;

  console.log(
    `${ok ? "✓" : "✗"} ${path.padEnd(28)} yan: rgb(${beside.join(",")})  alt: rgb(${below.join(",")})  fark: ${diff}`,
  );

  await page.close();
}

console.log(
  problems
    ? `\n${problems} sayfada başlığın arkası alttaki bölümden farklı.`
    : "\nTüm sayfalarda başlığın arkası alttaki bölümle aynı.",
);

await browser.close();
