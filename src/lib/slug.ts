/** Türkçe karakterleri koruyarak URL'e uygun slug üretir. */
const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

export function slugify(input: string): string {
  return input
    .trim()
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Aynı slug varsa sonuna sayı ekler: "genel-muayene" → "genel-muayene-2"
 */
export function uniqueSlug(base: string, taken: string[]): string {
  const slug = slugify(base) || "sayfa";
  if (!taken.includes(slug)) return slug;

  for (let i = 2; i < 100; i++) {
    const candidate = `${slug}-${i}`;
    if (!taken.includes(candidate)) return candidate;
  }

  return `${slug}-${Date.now()}`;
}
