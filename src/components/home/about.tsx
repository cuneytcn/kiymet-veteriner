import Image from "next/image";
import { Clock, FlaskConical, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section";
import { getSiteSettings } from "@/lib/site";

const buildPoints = (years: number) => [
  {
    icon: ShieldCheck,
    title: "Deneyimli veteriner hekim ekibi",
    text: `Cerrahi, dahiliye ve acil vakalarda ${years} yılı aşkın saha deneyimi.`,
    tone: "bg-brand-soft text-brand",
  },
  {
    icon: FlaskConical,
    title: "Klinik içi laboratuvar",
    text: "Tahlil sonuçları aynı ziyarette çıkar; acil vakalarda saatler kazandırır.",
    tone: "bg-leaf-soft text-leaf-dark",
  },
  {
    icon: Clock,
    title: "Randevunuza saygı",
    text: "Online randevu sistemiyle bekleme süresi neredeyse sıfır.",
    tone: "bg-sun-soft text-sun-dark",
  },
];

export async function About() {
  const settings = await getSiteSettings();

  return (
    <section className="py-[4.625rem] md:py-section" id="hakkimizda">
      <div className="container-page grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-15">
        {/* Fotoğraf bloğu */}
        <div className="reveal relative pb-8">
          <span
            className="absolute -top-4.5 -left-4.5 h-[76%] w-[74%] rounded-card bg-brand-soft"
            aria-hidden
          />

          <div className="relative aspect-[4/5] max-w-[25rem] overflow-hidden rounded-card shadow-md">
            <Image
              src="/img/vet-kitten.webp"
              alt="Veteriner hekim muayene masasında yavru bir kediyi muayene ediyor"
              fill
              sizes="(max-width: 1024px) 90vw, 400px"
              className="object-cover"
            />
          </div>

          {/* Deneyim rozeti */}
          <div className="absolute right-0 bottom-0 rounded-card bg-brand px-[1.625rem] py-5 text-center text-white shadow-lg">
            <span className="block font-head text-[2.5rem] leading-none font-bold">
              {settings.yearsOfExperience}+
            </span>
            <span className="mt-1 block text-[0.8125rem] opacity-95">
              yıllık deneyim
            </span>
          </div>
        </div>

        <div className="reveal">
          <Eyebrow label="Hakkımızda" />

          <h2 className="mt-3.5 text-[1.8125rem] md:text-[2.625rem]">
            Sadece tedavi etmiyoruz,
            <br />
            dostunuzu tanıyoruz
          </h2>

          <p className="mt-4 text-[1.03125rem] leading-relaxed text-muted">
            {settings.district}&apos;daki kliniğimizde her hastayı kendi geçmişi,
            alışkanlıkları ve yaşam koşullarıyla değerlendiriyoruz. Çünkü doğru
            teşhis, dostunuzu tanımakla başlar.
          </p>

          <ul className="mt-7 grid gap-[1.375rem]">
            {buildPoints(settings.yearsOfExperience).map(
              ({ icon: Icon, title, text, tone }) => (
              <li key={title} className="flex gap-4">
                <span
                  className={`grid size-[3.375rem] shrink-0 place-items-center rounded-full ${tone}`}
                >
                  <Icon className="size-6" aria-hidden />
                </span>
                <div>
                  <h3 className="text-[1.15625rem]">{title}</h3>
                  <p className="mt-1 text-[0.96875rem] text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-[2.125rem] flex flex-wrap items-center gap-6">
            <ButtonLink href="/randevu" size="lg">
              Randevu Al
            </ButtonLink>

            <span className="flex items-center gap-3">
              <span className="relative size-13 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/img/cat-pet.webp"
                  alt=""
                  fill
                  sizes="52px"
                  className="object-cover"
                />
              </span>
              <span>
                <span className="block font-head text-base font-bold">
                  {settings.clinicName} Ekibi
                </span>
                <span className="block text-[0.84375rem] text-muted">
                  {settings.district}, {settings.city}
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
