import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Eski (teal/ink) palet sınıflarını CarePress paletine taşır.
 * Sıra önemli: uzun eşleşmeler önce gelmeli.
 */
const MAP = [
  // Koyu pembe zemin üstündeki açık metinler
  [/text-brand-100\b/g, "text-white/90"],
  [/text-brand-200\b/g, "text-white/80"],
  [/text-brand-800\b/g, "text-brand-dark"],
  [/text-brand-900\b/g, "text-navy-deep"],
  [/bg-brand-950\b/g, "bg-navy-deep"],
  [/bg-brand-900\b/g, "bg-navy-deep"],
  [/bg-brand-800\b/g, "bg-brand-dark"],
  [/bg-brand-700\b/g, "bg-brand"],
  [/bg-brand-600\b/g, "bg-brand"],
  [/bg-brand-50\b/g, "bg-brand-soft"],
  [/bg-brand-100\b/g, "bg-brand-soft"],
  [/border-brand-200\b/g, "border-brand-line"],
  [/border-brand-300\b/g, "border-brand-line"],
  [/border-brand-400\b/g, "border-brand"],
  [/border-brand-700\b/g, "border-brand"],
  [/text-brand-600\b/g, "text-brand"],
  [/text-brand-700\b/g, "text-brand"],
  [/text-brand-400\b/g, "text-brand"],
  [/text-brand-300\b/g, "text-brand-line"],
  [/accent-brand-700\b/g, "accent-brand"],

  // Aksan → sarı
  [/text-accent-300\b/g, "text-sun"],
  [/bg-accent-500\b/g, "bg-sun"],
  [/bg-accent-400\b/g, "bg-sun"],
  [/text-accent-400\b/g, "text-sun"],
  [/bg-accent-200\/30\b/g, "bg-sun-soft"],

  // Nötrler
  [/bg-ink-950\b/g, "bg-navy-deep"],
  [/bg-ink-900\b/g, "bg-navy"],
  [/bg-ink-800(\/\d+)?\b/g, "bg-navy"],
  [/bg-ink-100\b/g, "bg-cream"],
  [/bg-ink-50\b/g, "bg-cream"],
  [/bg-ink-200\b/g, "bg-cream-2"],
  [/text-ink-950\b/g, "text-navy-deep"],
  [/text-ink-900\b/g, "text-navy"],
  [/text-ink-800\b/g, "text-navy"],
  [/text-ink-700\b/g, "text-navy"],
  [/text-ink-600\b/g, "text-muted"],
  [/text-ink-500\b/g, "text-muted"],
  [/text-ink-400\b/g, "text-muted"],
  [/text-ink-300\b/g, "text-muted"],
  [/border-ink-100\b/g, "border-line"],
  [/border-ink-200\b/g, "border-line"],
  [/border-ink-300\b/g, "border-line"],
  [/border-ink-800\b/g, "border-white/10"],
  [/hover:bg-ink-100\b/g, "hover:bg-cream"],
  [/hover:bg-ink-200\b/g, "hover:bg-cream-2"],
  [/hover:text-ink-900\b/g, "hover:text-navy"],
  [/hover:text-ink-300\b/g, "hover:text-white"],
  [/hover:border-ink-\d+\b/g, "hover:border-brand"],
  [/accent-\[var\(--color-brand-700\)\]/g, "accent-[var(--color-brand)]"],

  // Tipografi ve gölge adları
  [/font-display\b/g, "font-head"],
  [/shadow-soft\b/g, "shadow-sm"],
  [/shadow-lift\b/g, "shadow-md"],

  // Durum renkleri artık doğrudan Tailwind sınıfı
  [/text-\[var\(--color-danger\)\]/g, "text-danger"],
  [/bg-\[var\(--color-danger\)\]/g, "bg-danger"],
  [/bg-\[var\(--color-danger-soft\)\]/g, "bg-danger-soft"],
  [/border-\[var\(--color-danger\)\]\/\d+/g, "border-danger/30"],
  [/border-\[var\(--color-danger\)\]/g, "border-danger"],
  [/text-\[var\(--color-success\)\]/g, "text-success"],
  [/bg-\[var\(--color-success\)\]/g, "bg-success"],
  [/bg-\[var\(--color-success-soft\)\]/g, "bg-success-soft"],
  [/border-\[var\(--color-success\)\]\/\d+/g, "border-success/30"],
  [/text-\[var\(--color-warning\)\]/g, "text-warning"],
  [/bg-\[var\(--color-warning\)\]/g, "bg-warning"],
  [/bg-\[var\(--color-warning-soft\)\]/g, "bg-warning-soft"],
  [/border-\[var\(--color-warning\)\]\/\d+/g, "border-warning/30"],
  [/bg-\[var\(--color-danger\)\]\/15/g, "bg-danger/15"],
  [/text-\[var\(--color-danger-soft\)\]/g, "text-danger-soft"],
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(tsx|ts)$/.test(entry.name)) yield path;
  }
}

let changed = 0;

for await (const file of walk("src")) {
  const before = await readFile(file, "utf8");
  let after = before;
  for (const [pattern, replacement] of MAP) after = after.replace(pattern, replacement);

  if (after !== before) {
    await writeFile(file, after);
    console.log(`  ${file}`);
    changed++;
  }
}

console.log(`\n${changed} dosya güncellendi.`);
