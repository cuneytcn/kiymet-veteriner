import Link from "next/link";
import { ArrowRight, Home, Phone } from "lucide-react";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { PawGlyph } from "@/components/ui/section";
import { getServices } from "@/lib/content";
import { getSiteSettings, toTelHref } from "@/lib/site";

export default async function NotFound() {
  const [settings, services] = await Promise.all([
    getSiteSettings(),
    getServices(),
  ]);

  return (
    <div className="-mt-25 md:-mt-40 bg-[linear-gradient(160deg,#fdf1f5_0%,var(--color-cream)_38%,var(--color-cream)_100%)] pt-25 md:pt-40">
      <div className="container-page py-20 text-center md:py-28">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-brand-soft">
          <PawGlyph className="size-10 fill-brand" />
        </span>

        <p className="mt-7 font-head text-[4rem] leading-none font-bold text-brand md:text-[5rem]">
          404
        </p>

        <h1 className="mt-3 text-[1.75rem] md:text-[2.25rem]">
          Bu sayfanın izini kaybettik
        </h1>

        <p className="mx-auto mt-4 max-w-md text-[1.0625rem] text-muted">
          Aradığınız sayfa taşınmış veya hiç var olmamış olabilir. Aşağıdan
          devam edebilirsiniz.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <ButtonLink href="/" size="lg">
            <Home aria-hidden />
            Ana Sayfa
          </ButtonLink>
          <ButtonLink href="/randevu" variant="outline" size="lg">
            Randevu Al
          </ButtonLink>
          <ButtonAnchor
            href={toTelHref(settings.emergencyPhone)}
            variant="outline"
            size="lg"
          >
            <Phone aria-hidden />
            Acil Hat
          </ButtonAnchor>
        </div>

        {services.length > 0 && (
          <div className="mx-auto mt-14 max-w-2xl text-left">
            <p className="text-center font-head text-sm font-semibold tracking-wide text-muted uppercase">
              Belki bunları arıyordunuz
            </p>

            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {services.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/hizmetler/${s.slug}`}
                    className="group/nf flex items-center justify-between gap-3 rounded-card bg-white px-5 py-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <span className="font-head font-semibold text-navy transition-colors group-hover/nf:text-brand">
                      {s.title}
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-brand transition-transform duration-300 group-hover/nf:translate-x-1.5"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
