import { readFile, writeFile } from "node:fs/promises";

/** {{IMG:name}} yer tutucularını data URI ile değiştirir (Artifact CSP dış görsele izin vermiyor). */
const [, , src, dest] = process.argv;

let html = await readFile(src, "utf8");
const names = [...html.matchAll(/\{\{IMG:([a-z0-9-]+)\}\}/g)].map((m) => m[1]);

for (const name of new Set(names)) {
  const buf = await readFile(`public/img/${name}.webp`);
  const uri = `data:image/webp;base64,${buf.toString("base64")}`;
  html = html.replaceAll(`{{IMG:${name}}}`, uri);
  console.log(`  ${name}: ${(buf.length / 1024).toFixed(0)}KB`);
}

await writeFile(dest, html);
console.log(`→ ${dest}  (${(Buffer.byteLength(html) / 1024).toFixed(0)}KB total)`);
