import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Panel tasarımını dolu halde görebilmek için örnek veri.
 *
 *   node scripts/demo-data.mjs add     → örnek kayıtları ekler
 *   node scripts/demo-data.mjs remove  → yalnızca örnek kayıtları siler
 *
 * Tüm örnek kayıtlar işaretlidir (telefon 0555 900 ..., ekip notunda [ÖRNEK]),
 * böylece gerçek verilere dokunmadan temizlenebilir.
 */
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEMO_PHONE_PREFIX = "+90555900";
const DEMO_MARK = "[ÖRNEK]";

/** Bugünden n gün sonrası, @db.Date sütunuyla uyumlu UTC gece yarısı. */
const day = (offset) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
};

const team = [
  {
    name: "Vet. Hek. Ayşe Yıldırım",
    title: "Kurucu Veteriner Hekim",
    bio: `${DEMO_MARK} Ege Üniversitesi Veteriner Fakültesi mezunu. 15 yıldır küçük hayvan hekimliği, ağırlıklı olarak dahiliye ve acil vakalar.`,
    order: 1,
  },
  {
    name: "Vet. Hek. Mert Aydın",
    title: "Cerrahi Sorumlusu",
    bio: `${DEMO_MARK} Yumuşak doku ve ortopedik operasyonlar. Anestezi güvenliği ve ameliyat sonrası ağrı yönetimi üzerine çalışıyor.`,
    order: 2,
  },
  {
    name: "Vet. Hek. Selin Korkmaz",
    title: "Laboratuvar ve Görüntüleme",
    bio: `${DEMO_MARK} Klinik içi laboratuvar, ultrason ve radyoloji. Kronik hastalık takibinde düzenli tetkik planlaması.`,
    order: 3,
  },
  {
    name: "Elif Şahin",
    title: "Hasta Kabul Sorumlusu",
    bio: `${DEMO_MARK} Randevu planlaması, hasta kayıtları ve aşı takvimi hatırlatmaları.`,
    order: 4,
  },
];

const appointments = [
  {
    ownerName: "Deniz Kaya",
    phone: `${DEMO_PHONE_PREFIX}001`,
    email: "deniz.kaya@example.com",
    petName: "Pamuk",
    petType: "CAT",
    petBreed: "British Shorthair",
    petAge: "3 yaş",
    serviceSlug: "genel-muayene",
    dayOffset: 0,
    time: "14:00",
    status: "CONFIRMED",
    notes: "İki gündür iştahsız, halsiz görünüyor.",
  },
  {
    ownerName: "Burak Demir",
    phone: `${DEMO_PHONE_PREFIX}002`,
    email: "burak.demir@example.com",
    petName: "Zeytin",
    petType: "DOG",
    petBreed: "Golden Retriever",
    petAge: "8 ay",
    serviceSlug: "asi-saglik",
    dayOffset: 0,
    time: "16:30",
    status: "PENDING",
    notes: "Karma aşı tekrarı için.",
  },
  {
    ownerName: "Ceren Arslan",
    phone: `${DEMO_PHONE_PREFIX}003`,
    email: "ceren.arslan@example.com",
    petName: "Minnoş",
    petType: "CAT",
    petAge: "6 ay",
    serviceSlug: "cerrahi",
    dayOffset: 2,
    time: "10:00",
    status: "CONFIRMED",
    notes: "Kısırlaştırma randevusu. Aç bırakma talimatı verildi.",
    adminNote: "Ameliyat öncesi kan tahlili planlandı.",
  },
  {
    ownerName: "Emre Yalçın",
    phone: `${DEMO_PHONE_PREFIX}004`,
    email: "emre.yalcin@example.com",
    petName: "Boncuk",
    petType: "DOG",
    petBreed: "Terrier",
    petAge: "5 yaş",
    serviceSlug: "dis-bakimi",
    dayOffset: 3,
    time: "11:30",
    status: "PENDING",
  },
  {
    ownerName: "Gizem Öztürk",
    phone: `${DEMO_PHONE_PREFIX}005`,
    email: "gizem.ozturk@example.com",
    petName: "Şeker",
    petType: "BIRD",
    petAge: "2 yaş",
    serviceSlug: "genel-muayene",
    dayOffset: 5,
    time: "13:00",
    status: "PENDING",
  },
  {
    ownerName: "Okan Şen",
    phone: `${DEMO_PHONE_PREFIX}006`,
    email: "okan.sen@example.com",
    petName: "Karamel",
    petType: "DOG",
    petBreed: "Beagle",
    petAge: "4 yaş",
    serviceSlug: "laboratuvar",
    dayOffset: -3,
    time: "15:00",
    status: "COMPLETED",
    adminNote: "Kan değerleri normal, üç ay sonra kontrol.",
  },
  {
    ownerName: "Melis Uçar",
    phone: `${DEMO_PHONE_PREFIX}007`,
    email: "melis.ucar@example.com",
    petName: "Duman",
    petType: "CAT",
    petAge: "9 yaş",
    serviceSlug: "acil",
    dayOffset: -5,
    time: "19:30",
    status: "COMPLETED",
    notes: "İdrar yapamıyor, acil geldi.",
    adminNote: "Sonda takıldı, iki gün yatışlı kaldı.",
  },
  {
    ownerName: "Tolga Çetin",
    phone: `${DEMO_PHONE_PREFIX}008`,
    email: "tolga.cetin@example.com",
    petName: "Fındık",
    petType: "RABBIT",
    petAge: "1 yaş",
    serviceSlug: "genel-muayene",
    dayOffset: -2,
    time: "12:00",
    status: "CANCELLED",
    adminNote: "Müşteri iptal etti, hafta sonuna alınacak.",
  },
  {
    ownerName: "Sinem Aksoy",
    phone: `${DEMO_PHONE_PREFIX}009`,
    email: "sinem.aksoy@example.com",
    petName: "Leo",
    petType: "DOG",
    petBreed: "Pug",
    petAge: "2 yaş",
    serviceSlug: "asi-saglik",
    dayOffset: -6,
    time: "17:00",
    status: "NO_SHOW",
    adminNote: "Gelmedi, arandı ulaşılamadı.",
  },
];

const closures = [
  { dayOffset: 9, reason: "Resmi tatil", allDay: true },
  {
    dayOffset: 16,
    reason: "Ekip içi eğitim — kısa gün",
    allDay: false,
    openTime: "09:00",
    closeTime: "13:00",
  },
];

const draftPost = {
  slug: "kopeklerde-dis-bakimi",
  title: "Köpeklerde diş bakımı: evde ne yapabilirsiniz?",
  excerpt: `${DEMO_MARK} Diş taşı oluşmadan önce evde uygulayabileceğiniz basit bakım rutinleri ve ne zaman kliniğe gelmek gerektiği.`,
  content: `${DEMO_MARK} Bu yazı taslak halindedir, panelde taslak görünümünü denemek için eklenmiştir.

## Neden önemli

Diş eti iltihabı yalnızca ağız kokusu yapmaz; bakteriler kan dolaşımına geçerek kalp ve böbrekleri etkileyebilir.

## Evde bakım

- Köpeğinize özel diş fırçası ve macun kullanın
- Haftada en az üç kez fırçalayın
- İnsan diş macunu kullanmayın`,
  tags: ["köpek", "diş bakımı"],
  published: false,
};

// ---------------------------------------------------------------------------

const command = process.argv[2] ?? "add";

if (command === "add") {
  const services = await db.service.findMany({ select: { id: true, slug: true, title: true } });
  const byslug = new Map(services.map((s) => [s.slug, s]));

  let counts = { team: 0, appointments: 0, closures: 0, posts: 0 };

  for (const member of team) {
    const exists = await db.teamMember.findFirst({ where: { name: member.name } });
    if (!exists) {
      await db.teamMember.create({ data: member });
      counts.team++;
    }
  }

  for (const a of appointments) {
    const service = byslug.get(a.serviceSlug);
    const exists = await db.appointment.findFirst({ where: { phone: a.phone } });
    if (exists) continue;

    await db.appointment.create({
      data: {
        ownerName: a.ownerName,
        phone: a.phone,
        email: a.email,
        petName: a.petName,
        petType: a.petType,
        petBreed: a.petBreed ?? null,
        petAge: a.petAge ?? null,
        serviceId: service?.id ?? null,
        serviceLabel: service?.title ?? "Genel Muayene",
        date: day(a.dayOffset),
        time: a.time,
        status: a.status,
        notes: a.notes ?? null,
        adminNote: a.adminNote ?? null,
        notifiedEmail: a.status !== "PENDING",
      },
    });
    counts.appointments++;
  }

  for (const c of closures) {
    const date = day(c.dayOffset);
    const exists = await db.closure.findUnique({ where: { date } });
    if (!exists) {
      await db.closure.create({
        data: {
          date,
          reason: c.reason,
          allDay: c.allDay,
          openTime: c.openTime ?? null,
          closeTime: c.closeTime ?? null,
        },
      });
      counts.closures++;
    }
  }

  const postExists = await db.post.findUnique({ where: { slug: draftPost.slug } });
  if (!postExists) {
    await db.post.create({ data: draftPost });
    counts.posts++;
  }

  console.log(`Eklendi → ekip: ${counts.team}, randevu: ${counts.appointments}, kapanış: ${counts.closures}, taslak yazı: ${counts.posts}`);
  console.log("\nTemizlemek için: node scripts/demo-data.mjs remove");
} else if (command === "remove") {
  const a = await db.appointment.deleteMany({
    where: { phone: { startsWith: DEMO_PHONE_PREFIX } },
  });
  const t = await db.teamMember.deleteMany({
    where: { bio: { contains: DEMO_MARK } },
  });
  const p = await db.post.deleteMany({ where: { slug: draftPost.slug } });
  const c = await db.closure.deleteMany({
    where: { date: { in: closures.map((x) => day(x.dayOffset)) } },
  });

  console.log(`Silindi → randevu: ${a.count}, ekip: ${t.count}, yazı: ${p.count}, kapanış: ${c.count}`);
} else {
  console.log("Kullanım: node scripts/demo-data.mjs [add|remove]");
}

await db.$disconnect();
