import type { Metadata } from "next";
import Image from "next/image";
import {
  Award,
  Clock,
  FlaskConical,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Prose } from "@/components/ui/prose";
import { Section, SectionHeading } from "@/components/ui/section";
import { getPage, getTeam } from "@/lib/content";
import { getSiteSettings } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [page, s] = await Promise.all([getPage("hakkimizda"), getSiteSettings()]);

  return {
    title: page?.seoTitle ? { absolute: page.seoTitle } : "Hakkımızda",
    description:
      page?.seoDescription ||
      `${s.district} ${s.clinicName} hakkında: ekibimiz, kliniğimiz ve 10 yıllık deneyimimiz.`,
    alternates: { canonical: "/hakkimizda" },
  };
}

const values = [
  {
    icon: Stethoscope,
    title: "Önce doğru teşhis",
    text: "Her hastayı geçmişi, alışkanlıkları ve yaşam koşullarıyla birlikte değerlendiriyoruz.",
    tone: "bg-brand-soft text-brand",
  },
  {
    icon: HeartHandshake,
    title: "Sahibiyle birlikte karar",
    text: "Tedavi seçeneklerini, sürelerini ve maliyetlerini önceden açıkça paylaşıyoruz.",
    tone: "bg-leaf-soft text-leaf-dark",
  },
  {
    icon: FlaskConical,
    title: "Aynı gün sonuç",
    text: "Klinik içi laboratuvarımız sayesinde çoğu tahlilin sonucu ziyaret bitmeden çıkıyor.",
    tone: "bg-sun-soft text-sun-dark",
  },
  {
    icon: Clock,
    title: "Randevuya sadakat",
    text: "Online randevu sistemiyle bekleme süresini neredeyse sıfıra indirdik.",
    tone: "bg-navy-soft text-navy",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli anestezi",
    text: "Her operasyon öncesi kan tahlili, operasyon boyunca kesintisiz monitörizasyon.",
    tone: "bg-brand-soft text-brand",
  },
  {
    icon: Award,
    title: "10 yıllık süreklilik",
    text: "Aynı mahallede, aynı ekiple; dostunuzun geçmişi bizde kayıtlı kalıyor.",
    tone: "bg-leaf-soft text-leaf-dark",
  },
];

export default async function AboutPage() {
  const [page, team, settings] = await Promise.all([
    getPage("hakkimizda"),
    getTeam(),
    getSiteSettings(),
  ]);

  const crumbs = [
    { name: "Ana Sayfa", href: "/" },
    { name: "Hakkımızda", href: "/hakkimizda" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Hakkımızda"
        title={page?.title || `${settings.district}'nın veteriner kliniği`}
        description={
          page?.intro ||
          `${settings.district}'da 10 yıldır kedi ve köpeklerin sağlığından sorumluyuz. Kliniğimizi tanıyın.`
        }
        crumbs={crumbs}
      />

      {/* Klinik hikayesi */}
      <Section>
        <div className="container-page grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="reveal">
            {page?.content ? (
              <Prose content={page.content} />
            ) : (
              <div className="grid gap-5 text-[1.0625rem] leading-relaxed text-muted">
                <p>
                  {settings.clinicName}, {settings.district}&apos;da kedi ve
                  köpeklere yönelik koruyucu hekimlik, dahiliye, cerrahi ve acil
                  hizmet veren bir veteriner kliniğidir.
                </p>
                <p>
                  Kliniğimizde her ziyaret detaylı bir muayeneyle başlar.
                  Gerekirse klinik içi laboratuvarımızda tahliller yapılır ve
                  sonuçlar aynı ziyaret içinde değerlendirilir. Böylece tedaviye
                  başlamak için ertesi günü beklemek gerekmez.
                </p>
                <p>
                  Amacımız yalnızca hastalığı tedavi etmek değil; dostunuzun
                  yaşam kalitesini uzun vadede korumak. Bu yüzden aşı takvimi,
                  parazit koruması, diş sağlığı ve beslenme konularında da yol
                  gösteriyoruz.
                </p>
                <p className="rounded-card bg-cream p-5 text-navy">
                  Bu metni yönetim panelinden düzenleyebilirsiniz:{" "}
                  <strong className="font-semibold">Sayfalar → Hakkımızda</strong>
                </p>
              </div>
            )}
          </div>

          <div className="reveal relative">
            <span
              className="absolute -top-4 -right-4 h-[70%] w-[72%] rounded-card bg-brand-soft"
              aria-hidden
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-md">
              <Image
                src="/img/vet-hand-kitten.webp"
                alt="Veteriner hekimin elinde tuttuğu yavru kedi"
                fill
                sizes="(max-width: 1024px) 90vw, 440px"
                className="object-cover"
              />
            </div>

            <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                { v: "10+", l: "yıl" },
                { v: "5.000+", l: "hasta" },
                { v: "7/24", l: "acil" },
              ].map((s) => (
                <div key={s.l} className="rounded-card bg-cream px-3 py-4">
                  <dt className="sr-only">{s.l}</dt>
                  <dd>
                    <span className="block font-head text-2xl font-bold text-brand">
                      {s.v}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">{s.l}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* Değerlerimiz */}
      <Section tone="cream">
        <div className="container-page">
          <SectionHeading
            eyebrow="Çalışma prensibimiz"
            title="Kliniğimizi farklı kılan ne?"
            description="Her hastaya, kendi dostumuzmuş gibi yaklaşıyoruz."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, text, tone }) => (
              <div
                key={title}
                className="reveal rounded-card bg-white px-6 py-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-md"
              >
                <span
                  className={`grid size-14 place-items-center rounded-full ${tone}`}
                >
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-[1.15625rem]">{title}</h3>
                <p className="mt-2 text-[0.96875rem] text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Ekip */}
      {team.length > 0 && (
        <Section>
          <div className="container-page">
            <SectionHeading
              eyebrow="Ekibimiz"
              title="Dostunuzla ilgilenecek kişiler"
              description="Kliniğimizde her hastayı tanıyan sabit bir ekip çalışıyor."
            />

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="reveal overflow-hidden rounded-card bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-md"
                >
                  {member.photo ? (
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        sizes="(max-width: 640px) 92vw, 360px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center bg-cream">
                      <span className="font-head text-4xl font-bold text-brand-line">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="px-6 py-5">
                    <h3 className="text-[1.15625rem]">{member.name}</h3>
                    <p className="mt-0.5 font-head text-sm font-semibold text-brand">
                      {member.title}
                    </p>
                    {member.bio && (
                      <p className="mt-3 text-[0.9375rem] text-muted">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section tone="cream" className="py-16 md:py-16">
        <div className="container-page">
          <div className="rounded-card bg-brand px-8 py-12 text-center text-white md:px-12">
            <h2 className="text-[1.75rem] text-white md:text-[2.25rem]">
              Dostunuzu tanımamıza izin verin
            </h2>
            <p className="mx-auto mt-3 max-w-xl opacity-95">
              İlk muayene için randevu oluşturun; birlikte bir sağlık planı
              çıkaralım.
            </p>
            <div className="mt-7">
              <ButtonLink href="/randevu" variant="white" size="lg">
                Randevu Al
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <BreadcrumbJsonLd items={crumbs} />
    </>
  );
}
