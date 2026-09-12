import "dotenv/config";
import { Resend } from "resend";

/**
 * Resend alan adı doğrulamasından sonra gerçek gönderimi sınar.
 *
 *   node scripts/test-mail.mjs kime@ornek.com
 *
 * Doğrulama tamamlanmadan kendi adresin dışına gönderim 403 ile reddedilir;
 * hata mesajı zaten sebebi söyler.
 */
const to = process.argv[2];

if (!to) {
  console.error("Kullanım: node scripts/test-mail.mjs kime@ornek.com");
  process.exit(1);
}

const from = process.env.NOTIFY_FROM_EMAIL;
const key = process.env.RESEND_API_KEY;

if (!key || !from) {
  console.error("RESEND_API_KEY veya NOTIFY_FROM_EMAIL boş. .env dosyasını kontrol et.");
  process.exit(1);
}

console.log(`Gönderen : ${from}`);
console.log(`Alıcı    : ${to}\n`);

if (from.endsWith("@resend.dev")) {
  console.log("UYARI: resend.dev test adresi kullanılıyor.");
  console.log("Bu adresten yalnızca Resend hesabının sahibine mail gidebilir.\n");
}

const resend = new Resend(key);

const { data, error } = await resend.emails.send({
  from: `Kıymet Veteriner <${from}>`,
  to,
  subject: "Test gönderimi — Kıymet Veteriner",
  html: `<p>Bu bir test e-postasıdır.</p>
         <p>Bu mesajı gördüysen alan adı doğrulaması çalışıyor ve
         randevu bildirimleri müşterilere ulaşabilir.</p>`,
});

if (error) {
  console.error("Gönderilemedi:");
  console.error(error);
  process.exit(1);
}

console.log("Gönderildi. Mesaj kimliği:", data.id);
console.log("Teslim durumunu resend.com/emails adresinden izleyebilirsin.");
