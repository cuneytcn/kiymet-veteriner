import { chromium } from "playwright";

/**
 * Yayına çıkmadan önce SEO denetimi: başlık/açıklama uzunlukları, canonical,
 * yapısal veri, başlık hiyerarşisi, görsel alt metinleri ve paylaşım etiketleri.
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
  "/blog/kedilerde-asi-takvimi",
  "/randevu",
  "/kvkk",
];

const browser = await chromium.launch();
const issues = [];

for (const path of PAGES) {
  const page = await browser.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle" });

  const data = await page.evaluate(() => {
    const meta = (name) =>
      document.querySelector(`meta[name="${name}"]`)?.content ??
      document.querySelector(`meta[property="${name}"]`)?.content ??
      null;

    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => {
        try {
          return JSON.parse(s.textContent);
        } catch {
          return { "@type": "BOZUK JSON" };
        }
      })
      .map((d) => d["@type"]);

    const headings = [...document.querySelectorAll("h1,h2,h3")].map((h) =>
      Number(h.tagName[1]),
    );

    const contentImages = [...document.querySelectorAll("main img")].filter(
      (img) => img.width > 80 && img.height > 80,
    );

    return {
      title: document.title,
      description: meta("description"),
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
      ogTitle: meta("og:title"),
      ogImage: meta("og:image"),
      robots: meta("robots"),
      jsonLd,
      h1Count: headings.filter((l) => l === 1).length,
      headings,
      imagesTotal: contentImages.length,
      imagesWithoutAlt: contentImages.filter((i) => !i.alt?.trim()).length,
      lang: document.documentElement.lang,
    };
  });

  const problems = [];
  if (!data.title) problems.push("başlık yok");
  else if (data.title.length > 65) problems.push(`başlık uzun (${data.title.length})`);
  if (!data.description) problems.push("açıklama yok");
  else if (data.description.length > 165)
    problems.push(`açıklama uzun (${data.description.length})`);
  if (!data.canonical) problems.push("canonical yok");
  if (!data.ogImage) problems.push("og:image yok");
  if (data.h1Count !== 1) problems.push(`h1 sayısı ${data.h1Count}`);
  if (data.imagesWithoutAlt > 0)
    problems.push(`${data.imagesWithoutAlt} görselde alt yok`);
  if (data.lang !== "tr") problems.push(`lang="${data.lang}"`);

  if (problems.length) issues.push({ path, problems });

  console.log(`\n${path}`);
  console.log(`  başlık   : ${data.title.slice(0, 62)} (${data.title.length})`);
  console.log(`  açıklama : ${(data.description ?? "—").slice(0, 58)}... (${data.description?.length ?? 0})`);
  console.log(`  yapısal  : ${data.jsonLd.join(", ") || "yok"}`);
  console.log(`  görsel   : ${data.imagesTotal} içerik görseli, ${data.imagesWithoutAlt} alt'sız`);
  if (problems.length) console.log(`  ⚠ ${problems.join(" · ")}`);

  await page.close();
}

// Sitemap ve robots
const page = await browser.newPage();
const sitemap = await (await page.goto(BASE + "/sitemap.xml")).text();
const urlCount = (sitemap.match(/<url>/g) ?? []).length;
const robots = await (await page.goto(BASE + "/robots.txt")).text();

console.log(`\n=== Site geneli ===`);
console.log(`sitemap.xml : ${urlCount} adres`);
console.log(`robots.txt  : ${robots.includes("Disallow: /admin") ? "panel kapalı ✓" : "panel AÇIK ✗"}`);
console.log(`sitemap bağı: ${robots.includes("Sitemap:") ? "var ✓" : "YOK ✗"}`);

console.log(
  issues.length
    ? `\n${issues.length} sayfada eksik var.`
    : "\nTüm sayfalar temiz.",
);

await browser.close();
