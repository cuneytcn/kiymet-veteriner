import sharp from "sharp";
import { readFile } from "node:fs/promises";

/**
 * Paylaşım görseli (1200x630). WhatsApp, Facebook ve X'te bağlantı
 * paylaşıldığında görünür.
 */
const logo = await readFile("public/img/logo.png");
const logoResized = await sharp(logo).resize({ width: 520 }).toBuffer();
const logoMeta = await sharp(logoResized).metadata();

const bg = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fdf1f5"/>
      <stop offset="55%" stop-color="#f4f2ef"/>
      <stop offset="100%" stop-color="#ffe8ef"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1105" cy="95" r="230" fill="#ffffff" opacity="0.55"/>
  <circle cx="95" cy="560" r="170" fill="#ff4880" opacity="0.07"/>
  <text x="600" y="430" font-family="Poppins, Segoe UI, sans-serif" font-size="44"
        font-weight="700" fill="#393d72" text-anchor="middle">
    Bornova'da 7/24 acil veteriner hizmeti
  </text>
  <text x="600" y="492" font-family="Open Sans, Segoe UI, sans-serif" font-size="29"
        fill="#7a7ea6" text-anchor="middle">
    Genel muayene · Aşı · Cerrahi · Laboratuvar · Online randevu
  </text>
  <rect x="470" y="540" width="260" height="8" rx="4" fill="#ff4880"/>
</svg>
`);

await sharp(bg)
  .composite([
    {
      input: logoResized,
      top: 160,
      left: Math.round((1200 - (logoMeta.width ?? 520)) / 2),
    },
  ])
  .png()
  .toFile("public/og.png");

const out = await sharp("public/og.png").metadata();
console.log(`og.png: ${out.width}x${out.height}`);
