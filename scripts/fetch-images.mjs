import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

/**
 * Önizleme ve site için CC0 stok görselleri indirir, webp'ye çevirir.
 * Kaynaklar: rawpixel + stocksnap (Openverse üzerinden, cc0, ticari kullanım serbest).
 */
const IMAGES = [
  { name: "hero-dog", w: 1100, url: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdXB3azYxODc3NjYwLXdpa2ltZWRpYS1pbWFnZS1rb3dkbTY2aS5qcGc.jpg" },
  { name: "vet-kitten", w: 1000, url: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvc3YyMDE5OTMtaW1hZ2Uta3oyZHpyZ2UuanBn.jpg" },
  { name: "vet-hand-kitten", w: 900, url: "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L3drNjk2OTM0MjctaW1hZ2Uta3A2ZDBubHUuanBn.jpg" },
  { name: "dog-smile", w: 900, url: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvbnM3OTkwLWltYWdlLWt3eXJzd2trLmpwZw.jpg" },
  { name: "cat-gray", w: 900, url: "https://cdn.stocksnap.io/img-thumbs/960w/OU5O7ZUVH7.jpg" },
  { name: "cat-pet", w: 900, url: "https://cdn.stocksnap.io/img-thumbs/960w/C9D795487E.jpg" },
  { name: "dog-outdoors", w: 900, url: "https://cdn.stocksnap.io/img-thumbs/960w/Z1DLGX7470.jpg" },
  { name: "dog-puppy", w: 900, url: "https://cdn.stocksnap.io/img-thumbs/960w/TBA5BQMCQE.jpg" },
];

await mkdir("public/img", { recursive: true });

for (const img of IMAGES) {
  try {
    const res = await fetch(img.url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "image/*" },
    });
    if (!res.ok) {
      console.log(`✗ ${img.name}: HTTP ${res.status}`);
      continue;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();

    const out = await sharp(buf)
      .resize({ width: img.w, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();

    await writeFile(`public/img/${img.name}.webp`, out);
    console.log(
      `✓ ${img.name}.webp  ${meta.width}x${meta.height} → ${(out.length / 1024).toFixed(0)}KB`,
    );
  } catch (e) {
    console.log(`✗ ${img.name}: ${e.message}`);
  }
}
