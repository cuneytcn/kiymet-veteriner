import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { pages, posts } from "./seed-content";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const services = [
  {
    slug: "genel-muayene",
    title: "Genel Muayene",
    shortDescription:
      "Dostunuzun genel sağlık durumunu baştan aşağı değerlendiren kapsamlı klinik muayene.",
    icon: "stethoscope",
    highlights: [
      "Detaylı fiziki muayene ve anamnez",
      "Ateş, nabız, solunum ve vücut kondisyon skoru takibi",
      "Ağız, diş, kulak ve göz kontrolü",
      "Gerekli durumlarda ileri tetkik yönlendirmesi",
    ],
    content:
      "Genel muayene, hastalıkların erken fark edilmesinin en etkili yoludur. Kliniğimizde her muayene, sahibinden alınan detaylı bilgi (anamnez) ile başlar; ardından dostunuzun tüm sistemleri sırayla değerlendirilir.\n\nYılda en az bir kez, yaşlı hayvanlarda ise altı ayda bir genel muayene öneriyoruz. Erken teşhis hem tedavi başarısını artırır hem de tedavi maliyetini ciddi biçimde düşürür.",
    seoTitle: "Genel Muayene | Bornova Veteriner Kliniği",
    seoDescription:
      "Bornova'da kedi ve köpekler için kapsamlı genel veteriner muayenesi. Erken teşhis için düzenli kontrol randevusu alın.",
    order: 1,
  },
  {
    slug: "asi-saglik",
    title: "Aşı & Sağlık Takibi",
    shortDescription:
      "Karma, kuduz ve bronşit aşıları ile yaşam boyu düzenli sağlık takibi.",
    icon: "syringe",
    highlights: [
      "Yavru ve erişkin aşı programları",
      "Kuduz aşısı ve pasaport işlemleri",
      "Mikroçip uygulaması ve kayıt",
      "Aşı takvimi hatırlatma",
    ],
    content:
      "Aşılama, bulaşıcı ve çoğu zaman ölümcül hastalıklara karşı en güçlü korumadır. Yavrularda aşı programı genellikle 6-8. haftada başlar ve belirli aralıklarla tekrarlanır.\n\nKliniğimizde her hastanın aşı takvimi kayıt altında tutulur; aşı zamanı yaklaştığında sizi bilgilendiririz. Yurt dışı seyahati planlıyorsanız kuduz aşısı, mikroçip ve pasaport işlemlerini birlikte planlayalım.",
    seoTitle: "Kedi Köpek Aşı Takvimi | Bornova Veteriner",
    seoDescription:
      "Bornova'da karma aşı, kuduz aşısı, mikroçip ve pet pasaport işlemleri. Aşı takviminizi birlikte planlayalım.",
    order: 2,
  },
  {
    slug: "cerrahi",
    title: "Cerrahi İşlemler",
    shortDescription:
      "Kısırlaştırmadan ileri operasyonlara, modern anestezi ve monitörizasyon eşliğinde.",
    icon: "scissors",
    highlights: [
      "Kedi ve köpek kısırlaştırma",
      "Yumuşak doku ve ortopedik operasyonlar",
      "Ameliyat öncesi kan tahlili ve anestezi risk değerlendirmesi",
      "Operasyon sırasında sürekli monitörizasyon",
    ],
    content:
      "Her cerrahi işlem öncesinde kan tahlili yapar, anestezi protokolünü hastanın yaşına, kilosuna ve genel durumuna göre belirleriz. Operasyon boyunca kalp ritmi, oksijen satürasyonu ve vücut sıcaklığı kesintisiz izlenir.\n\nAmeliyat sonrası ağrı yönetimi ve iyileşme takibi sürecin ayrılmaz parçasıdır; taburcu olurken bakım talimatlarını yazılı olarak veririz.",
    seoTitle: "Veteriner Cerrahi ve Kısırlaştırma | Bornova İzmir",
    seoDescription:
      "Bornova'da kedi köpek kısırlaştırma ve ileri cerrahi operasyonlar. Modern anestezi ve tam monitörizasyon.",
    order: 3,
  },
  {
    slug: "laboratuvar",
    title: "Laboratuvar",
    shortDescription:
      "Klinik içi laboratuvarımızda hemogram, biyokimya ve hızlı test sonuçları.",
    icon: "flask-conical",
    highlights: [
      "Tam kan sayımı ve biyokimya paneli",
      "Hızlı enfeksiyon testleri",
      "İnce iğne biyopsisi ve sitoloji",
      "Mantar kültürü ve deri kazıntısı",
    ],
    content:
      "Klinik içi laboratuvarımız sayesinde çoğu tahlilin sonucu aynı ziyaret içinde çıkar. Bu, özellikle acil vakalarda tedaviye saatler kazandırır.\n\nKronik hastalık takibinde düzenli kan değerleri, tedavinin işe yarayıp yaramadığını gösteren en nesnel veridir.",
    seoTitle: "Veteriner Laboratuvar Hizmetleri | Bornova",
    seoDescription:
      "Bornova'da klinik içi veteriner laboratuvarı: hemogram, biyokimya, hızlı test ve sitoloji. Aynı gün sonuç.",
    order: 4,
  },
  {
    slug: "acil",
    title: "Acil Müdahale",
    shortDescription:
      "Zehirlenme, travma, doğum güçlüğü ve solunum sıkıntısında 7/24 acil hat.",
    icon: "siren",
    highlights: [
      "7/24 ulaşılabilir acil telefon hattı",
      "Travma ve kanama kontrolü",
      "Zehirlenme müdahalesi",
      "Oksijen desteği ve sıvı tedavisi",
    ],
    content:
      "Acil durumlarda kaybedilen her dakika önemlidir. Yüksekten düşme, araç çarpması, zehirli madde yutma, nefes darlığı, doğum güçlüğü, idrar yapamama ve havale geçirme gibi durumlarda vakit kaybetmeden acil hattımızı arayın.\n\nYolda olduğunuzu bildirmeniz, biz hazırlığa başlayabildiğimiz için müdahale süresini kısaltır.",
    seoTitle: "7/24 Acil Veteriner | Bornova İzmir",
    seoDescription:
      "Bornova'da 7/24 acil veteriner hizmeti. Zehirlenme, travma ve doğum güçlüğünde hemen arayın.",
    order: 5,
  },
  {
    slug: "dis-bakimi",
    title: "Diş Bakımı",
    shortDescription:
      "Diş taşı temizliği, çekim ve ağız içi kontrolleri ile ağız sağlığı.",
    icon: "smile",
    highlights: [
      "Ultrasonik diş taşı temizliği",
      "Diş çekimi ve ağız içi cerrahi",
      "Diş eti hastalıklarının tedavisi",
      "Evde bakım için öneriler",
    ],
    content:
      "Diş taşı ve diş eti iltihabı yalnızca ağız kokusu yapmaz; bakteriler kan dolaşımına geçerek kalp ve böbrek gibi organları etkileyebilir.\n\nİşlem genel anestezi altında yapılır, öncesinde kan tahlili ile anestezi uygunluğu değerlendirilir. Sonrasında evde uygulayabileceğiniz bakım rutinini birlikte belirleriz.",
    seoTitle: "Kedi Köpek Diş Taşı Temizliği | Bornova Veteriner",
    seoDescription:
      "Bornova'da ultrasonik diş taşı temizliği, diş çekimi ve ağız sağlığı kontrolü.",
    order: 6,
  },
];

const priceCategories = [
  {
    title: "Genel Muayene",
    order: 1,
    items: [
      { name: "Kedi / Köpek Muayene", price: "1.500₺" },
      { name: "Endoskopik Muayene", price: "6.000₺" },
      { name: "Rinoskopik Muayene", price: "5.000₺" },
      { name: "Mikroçip Uygulaması", price: "650₺" },
      { name: "Sahip Değişikliği", price: "650₺" },
    ],
  },
  {
    title: "Aşılar",
    order: 2,
    items: [
      { name: "Karma Aşı (Kedi / Köpek)", price: "1.500₺" },
      { name: "Kuduz Aşısı", price: "1.500₺" },
      { name: "Köpek Bronşit Aşısı", price: "1.500₺" },
    ],
  },
  {
    title: "Cerrahi İşlemler",
    order: 3,
    items: [
      { name: "Kedi Kısırlaştırma (Dişi)", price: "5.500₺" },
      { name: "Kedi Kısırlaştırma (Erkek)", price: "4.500₺" },
      { name: "Köpek Kısırlaştırma (Dişi)", price: "7.000₺ - 10.000₺", note: "Irk ve kiloya göre değişir" },
      { name: "Köpek Kısırlaştırma (Erkek)", price: "6.000₺ - 7.000₺", note: "Irk ve kiloya göre değişir" },
      { name: "Diş Taşı Temizliği", price: "3.400₺" },
    ],
  },
  {
    title: "Laboratuvar",
    order: 4,
    items: [
      { name: "Tam Kan Sayımı", price: "1.350₺" },
      { name: "Biyokimya", price: "5.000₺" },
      { name: "İnce İğne Biyopsisi", price: "1.500₺" },
      { name: "Mantar Kültürü", price: "2.500₺" },
    ],
  },
  {
    title: "Görüntüleme",
    order: 5,
    items: [
      { name: "Röntgen", price: "1.200₺" },
      { name: "MR", price: "15.500₺" },
      { name: "Tomografi", price: "13.250₺" },
      { name: "Ultrason", price: "2.500₺" },
    ],
  },
  {
    title: "Diğer Hizmetler",
    order: 6,
    items: [
      { name: "Tıraş / Bakım", price: "1.000₺" },
      { name: "Parazit Tedavisi", price: "1.300₺ - 1.700₺" },
      { name: "Sağlık Raporu", price: "200₺" },
    ],
  },
];

// dayOfWeek: 0=Pazar ... 6=Cumartesi
const businessHours = [
  { dayOfWeek: 0, openTime: "12:00", closeTime: "17:00", isClosed: false },
  { dayOfWeek: 1, openTime: "09:00", closeTime: "21:00", isClosed: false },
  { dayOfWeek: 2, openTime: "09:00", closeTime: "21:00", isClosed: false },
  { dayOfWeek: 3, openTime: "09:00", closeTime: "21:00", isClosed: false },
  { dayOfWeek: 4, openTime: "09:00", closeTime: "21:00", isClosed: false },
  { dayOfWeek: 5, openTime: "09:00", closeTime: "21:00", isClosed: false },
  { dayOfWeek: 6, openTime: "09:00", closeTime: "20:00", isClosed: false },
];

const faqs = [
  {
    question: "Randevusuz gelebilir miyim?",
    answer:
      "Acil durumlarda randevusuz gelebilirsiniz, önce acil hattımızı aramanız müdahaleyi hızlandırır. Rutin muayene ve aşı için randevu almanız bekleme sürenizi ciddi biçimde kısaltır.",
    group: "genel",
    order: 1,
  },
  {
    question: "Yavru kedimin ilk aşısı ne zaman yapılmalı?",
    answer:
      "Yavrularda aşı programı genellikle 6-8. haftada başlar ve 3-4 hafta arayla tekrarlanır. Kuduz aşısı ise 12. haftadan sonra uygulanır. İlk muayenede yavrunuza özel takvimi birlikte çıkarırız.",
    group: "genel",
    order: 2,
  },
  {
    question: "Kısırlaştırma için uygun yaş nedir?",
    answer:
      "Kedilerde genellikle 6-8 ay, köpeklerde ırk ve boyuta göre 6-18 ay arası önerilir. Büyük ırk köpeklerde gelişimin tamamlanması beklenir. Muayene sonrası dostunuz için en uygun zamanı belirtiriz.",
    group: "genel",
    order: 3,
  },
  {
    question: "Ameliyat öncesi aç bırakmalı mıyım?",
    answer:
      "Evet. Yetişkin hayvanlarda operasyondan önce 8-12 saat katı gıda verilmemelidir; su genellikle 2 saat öncesine kadar serbesttir. Yavru ve diyabetli hastalarda süre farklıdır, size özel talimat veririz.",
    group: "genel",
    order: 4,
  },
  {
    question: "Randevumu nasıl iptal edebilirim veya değiştirebilirim?",
    answer:
      "Randevu saatinden en az 2 saat önce bizi arayarak iptal veya değişiklik talebinde bulunabilirsiniz. Böylece o saat ihtiyacı olan başka bir hastaya açılır.",
    group: "randevu",
    order: 1,
  },
  {
    question: "Randevu talebim hemen onaylanıyor mu?",
    answer:
      "Talebiniz bize ulaştığında kaydedilir ve klinik ekibimiz en kısa sürede telefonla teyit eder. Onay mesajı almadan randevunuz kesinleşmiş sayılmaz.",
    group: "randevu",
    order: 2,
  },
];

async function main() {
  console.log("Seed başlıyor...");

  // --- Site ayarları -------------------------------------------------------
  await db.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      clinicName: "Kıymet Veteriner Kliniği",
      tagline: "Bornova'da 10 yıldır dostlarınızın yanındayız",
      description:
        "İzmir Bornova'da genel muayene, aşı, cerrahi, laboratuvar ve 7/24 acil veteriner hizmetleri.",
      phone: "0232 351 52 53",
      emergencyPhone: "+90 538 694 44 55",
      email: "info@kiymetveteriner.com",
      addressLine: "İnönü Mah. Hürriyet Cd. No:238",
      district: "Bornova",
      city: "İzmir",
      postalCode: "35030",
      whatsappNumber: "+90 538 694 44 55",
      instagramUrl: "https://www.instagram.com/kiymetveterinerklinigi",
      // Aşağıdakiler klinik adından türetilmiş tahminlerdir; doğrulanmalı
      facebookUrl: "https://www.facebook.com/kiymetveterinerklinigi",
      youtubeUrl: "https://www.youtube.com/@kiymetveterinerklinigi",
      tiktokUrl: "https://www.tiktok.com/@kiymetveterinerklinigi",
      xUrl: "https://x.com/kiymetveteriner",
      seoTitle: "Kıymet Veteriner Kliniği | Bornova İzmir Veteriner",
      seoDescription:
        "Bornova'da 7/24 acil veteriner hizmeti, genel muayene, aşı, cerrahi ve laboratuvar. Online randevu alın.",
    },
  });

  // --- Hizmetler -----------------------------------------------------------
  for (const s of services) {
    await db.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }

  // --- Fiyat listesi -------------------------------------------------------
  for (const cat of priceCategories) {
    const existing = await db.priceCategory.findFirst({
      where: { title: cat.title },
    });
    if (existing) continue;

    await db.priceCategory.create({
      data: {
        title: cat.title,
        order: cat.order,
        items: {
          create: cat.items.map((item, index) => ({
            name: item.name,
            price: item.price,
            note: "note" in item ? item.note : null,
            order: index + 1,
          })),
        },
      },
    });
  }

  // --- Çalışma saatleri ----------------------------------------------------
  for (const h of businessHours) {
    await db.businessHour.upsert({
      where: { dayOfWeek: h.dayOfWeek },
      update: {},
      create: h,
    });
  }

  // --- SSS -----------------------------------------------------------------
  for (const f of faqs) {
    const existing = await db.faq.findFirst({ where: { question: f.question } });
    if (!existing) await db.faq.create({ data: f });
  }

  // --- Sayfalar (hakkımızda, KVKK, gizlilik, şartlar) ----------------------
  for (const page of pages) {
    await db.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  // --- Blog yazıları -------------------------------------------------------
  // Yayın tarihlerini bugünden geriye doğru haftalık aralıklarla dağıt
  const now = Date.now();
  const WEEK = 7 * 24 * 60 * 60 * 1000;

  for (const [index, post] of posts.entries()) {
    await db.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        published: true,
        publishedAt: new Date(now - index * WEEK),
      },
    });
  }

  // --- Yönetici kullanıcı --------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    await db.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: "Klinik Yöneticisi",
        role: "ADMIN",
        passwordHash: await bcrypt.hash(adminPassword, 12),
      },
    });
    console.log(`Yönetici hesabı hazır: ${adminEmail}`);
  } else {
    console.log(
      "ADMIN_EMAIL / ADMIN_PASSWORD tanımlı değil, yönetici hesabı atlandı.",
    );
  }

  console.log("Seed tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
