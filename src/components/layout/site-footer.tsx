import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { getServices } from "@/lib/content";
import { formatAddress, getSiteSettings, toTelHref } from "@/lib/site";
import Image from "next/image";
import { getSocialLinks } from "@/lib/socials";

const clinicLinks = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
];

export async function SiteFooter() {
  const [settings, services] = await Promise.all([
    getSiteSettings(),
    getServices(),
  ]);

  return (
    <footer className="bg-navy-deep pt-16 text-[0.9375rem] text-muted-light">
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* Marka */}
          <div>
            <Link
              href="/"
              className="inline-flex transition-transform duration-300 hover:scale-[1.02]"
              aria-label="Kıymet Veteriner Kliniği — ana sayfa"
            >
              <Image
                src="/img/logo-light.png"
                alt="Kıymet Veteriner Kliniği"
                width={700}
                height={234}
                className="h-14 w-auto"
              />
            </Link>

            <p className="mt-[1.125rem] max-w-[28em] leading-relaxed">
              {settings.description}
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {getSocialLinks(settings).map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors duration-300 hover:bg-brand"
                  >
                    <Icon className="size-[1.0625rem]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title="Hizmetler">
            {services.map((s) => (
              <li key={s.slug}>
                <FooterLink href={`/hizmetler/${s.slug}`}>{s.title}</FooterLink>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Klinik">
            {clinicLinks.map((l) => (
              <li key={l.href}>
                <FooterLink href={l.href}>{l.label}</FooterLink>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="İletişim">
            <li className="flex gap-3">
              <MapPin className="mt-1.5 size-4 shrink-0 text-brand" aria-hidden />
              <span className="leading-relaxed">{formatAddress(settings)}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-1.5 size-4 shrink-0 text-brand" aria-hidden />
              <span className="grid gap-1">
                <a
                  href={toTelHref(settings.phone)}
                  className="transition-colors hover:text-brand"
                >
                  {settings.phone}
                </a>
                <a
                  href={toTelHref(settings.emergencyPhone)}
                  className="transition-colors hover:text-brand"
                >
                  {settings.emergencyPhone}{" "}
                  <span className="text-[0.8125rem]">(acil)</span>
                </a>
              </span>
            </li>
          </FooterColumn>
        </div>

        <div className="mt-[2.875rem] flex flex-wrap justify-between gap-3 border-t border-white/10 py-[1.375rem] text-[0.84375rem]">
          <p>
            © {new Date().getFullYear()} {settings.clinicName}. Tüm hakları
            saklıdır.
          </p>
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/gizlilik-politikasi"
              className="transition-colors hover:text-brand"
            >
              Gizlilik Politikası
            </Link>
            <Link
              href="/kullanim-sartlari"
              className="transition-colors hover:text-brand"
            >
              Kullanım Şartları
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={title}>
      {/* Başlığın altındaki kısa pembe çizgi referanstan */}
      <h4 className="relative pb-3.5 text-[1.0625rem] text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-9 after:rounded-sm after:bg-brand after:content-['']">
        {title}
      </h4>
      <ul className="mt-[1.125rem] grid gap-[0.6875rem]">{children}</ul>
    </nav>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-block transition-all duration-200 hover:pl-1.5 hover:text-brand"
    >
      {children}
    </Link>
  );
}
