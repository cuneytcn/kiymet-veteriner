import "dotenv/config";
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Randevu akışının uçtan uca testi:
 * form → kayıt → panelde görünürlük → çakışma koruması → temizlik.
 * Test kaydı sonunda silinir.
 */
const BASE = "http://localhost:3000";
const TEST_PHONE = "0555 000 11 22";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

const serverErrors = [];
page.on("pageerror", (e) => serverErrors.push(e.message));

// --- 1. Formu doldur -------------------------------------------------------
await page.goto(`${BASE}/randevu`, { waitUntil: "networkidle" });

// Müsait ilk günü seç
const day = page.locator('[role="radio"][aria-checked="false"]:not([disabled])').first();
const dayLabel = await day.getAttribute("aria-label");
await day.click();
console.log(`1. gün seçildi: ${dayLabel}`);

// Saatler yüklensin, müsait ilk saati seç
await page.waitForSelector('button[role="radio"]:not([disabled])', { timeout: 15000 });
await page.waitForTimeout(1500);

const slot = page
  .locator('div[role="radiogroup"][aria-label*="saatleri"] button:not([disabled])')
  .first();
const slotTime = (await slot.textContent())?.trim();
await slot.click();
console.log(`2. saat seçildi: ${slotTime}`);

await page.fill("#petName", "Test Pamuk");
await page.selectOption("#petType", "CAT");
await page.selectOption("#serviceId", { index: 1 });
await page.fill("#ownerName", "Test Kullanıcı");
await page.fill("#phone", TEST_PHONE);
await page.fill("#email", process.env.NOTIFY_TO_EMAIL || "test@example.com");
await page.fill("#notes", "Bu bir sistem testidir.");
await page.check('input[name="consent"]');
console.log("3. form dolduruldu");

// --- 2. Gönder -------------------------------------------------------------
await page.click('button[type="submit"]');
await page.waitForTimeout(8000);

const successVisible = await page
  .getByText("Randevu talebiniz alındı")
  .isVisible()
  .catch(() => false);

console.log(`4. sonuç: ${successVisible ? "✓ başarı ekranı geldi" : "✗ başarı ekranı YOK"}`);

if (!successVisible) {
  const alert = await page.locator('[role="alert"]').first().textContent().catch(() => null);
  console.log(`   hata mesajı: ${alert?.trim() || "(yok)"}`);
}

// --- 3. Veritabanı kontrolü ------------------------------------------------
const saved = await db.appointment.findFirst({
  where: { phone: { contains: "5550001122" } },
  orderBy: { createdAt: "desc" },
});

if (saved) {
  console.log(`5. veritabanı: ✓ kayıt var`);
  console.log(`   ${saved.petName} / ${saved.ownerName} — ${saved.serviceLabel}`);
  console.log(`   tarih: ${saved.date.toISOString().slice(0, 10)} ${saved.time}`);
  console.log(`   durum: ${saved.status}`);
  console.log(`   bildirim: e-posta=${saved.notifiedEmail} whatsapp=${saved.notifiedWhatsapp}`);
} else {
  console.log("5. veritabanı: ✗ KAYIT YOK");
}

// --- 4. Çakışma koruması ---------------------------------------------------
if (saved) {
  await page.goto(`${BASE}/randevu`, { waitUntil: "networkidle" });
  const dateKey = saved.date.toISOString().slice(0, 10);
  const dayBtn = page.locator(`[role="radio"][aria-label*="${new Date(dateKey).getUTCDate()}"]`).first();

  await dayBtn.click().catch(() => {});
  await page.waitForTimeout(2000);

  const takenSlot = page.locator(
    `div[role="radiogroup"][aria-label*="saatleri"] button:has-text("${saved.time}")`,
  ).first();

  const isDisabled = await takenSlot.isDisabled().catch(() => null);
  console.log(
    `6. çakışma koruması: ${isDisabled === true ? "✓ dolu saat kapalı" : isDisabled === false ? "✗ saat hâlâ seçilebilir" : "? saat bulunamadı"}`,
  );
}

// --- 5. Panelde görünüyor mu ----------------------------------------------
await page.goto(`${BASE}/admin/giris`, { waitUntil: "networkidle" });
await page.fill("#email", process.env.ADMIN_EMAIL);
await page.fill("#password", process.env.ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/admin");

const onDashboard = await page.getByText("Test Pamuk").first().isVisible().catch(() => false);
console.log(`7. panel: ${onDashboard ? "✓ randevu panelde görünüyor" : "✗ panelde görünmüyor"}`);

// --- 6. Temizlik -----------------------------------------------------------
if (saved) {
  await db.appointment.delete({ where: { id: saved.id } });
  console.log("8. temizlik: ✓ test randevusu silindi");
}

if (serverErrors.length) {
  console.log(`\n${serverErrors.length} JS hatası:`);
  serverErrors.slice(0, 3).forEach((e) => console.log("  " + e.slice(0, 160)));
}

await browser.close();
await db.$disconnect();
