import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "C:/Users/dev/Downloads/kiymet-veteriner-logo.png";
await mkdir("public/img", { recursive: true });

const meta = await sharp(SRC).metadata();
console.log(`kaynak: ${meta.width}x${meta.height} ${meta.format}`);

// Yatay logo — retina için 2x genişlikte
const wide = await sharp(SRC)
  .trim()
  .resize({ width: 600, withoutEnlargement: true })
  .webp({ quality: 92 })
  .toBuffer();
await sharp(wide).toFile("public/img/logo.webp");
const wideMeta = await sharp(wide).metadata();
console.log(`logo.webp: ${wideMeta.width}x${wideMeta.height} — ${(wide.length / 1024).toFixed(0)}KB`);

// Yalnızca pati — favicon için. Kırpma ayrı bir işlemde yapılmalı.
const cropped = await sharp(SRC)
  .extract({ left: 0, top: 0, width: Math.round(meta.width * 0.34), height: meta.height })
  .toBuffer();

const paw = await sharp(cropped)
  .trim()
  .resize({
    width: 512,
    height: 512,
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await sharp(paw).toFile("public/img/logo-mark.png");
console.log();

// Favicon boyutları
await sharp(paw).resize(180, 180).png().toFile("public/apple-icon.png");
await sharp(paw).resize(32, 32).png().toFile("public/icon.png");
console.log("favicon: apple-icon.png + icon.png");
