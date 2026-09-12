import { Mail, Phone } from "lucide-react";
import { getServices } from "@/lib/content";
import { getSiteSettings, toTelHref } from "@/lib/site";
import { getSocialLinks } from "@/lib/socials";
import { HeaderNav } from "./header-nav";
import { DrawerContent } from "./drawer-content";

export async function SiteHeader() {
  const [settings, services] = await Promise.all([
    getSiteSettings(),
    getServices(),
  ]);

  const socials = getSocialLinks(settings);

  return (
    <>
      {/* Üst şerit — zeminle aynı renkte, ince ayırıcılarla */}
      <div className="relative z-40 hidden md:block">
        <div className="mx-auto w-full max-w-[88rem] px-5 md:px-8">
        <div className="flex h-15 flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[0.9375rem]">
          <ul className="flex flex-wrap items-center gap-y-2">
            <li className="flex items-center gap-2.5 pr-6">
              <Mail className="size-4 shrink-0 text-brand" aria-hidden />
              <a
                href={`mailto:${settings.email}`}
                className="font-semibold text-navy transition-colors hover:text-brand"
              >
                {settings.email}
              </a>
            </li>

            <li className="flex items-center gap-2.5 border-line pl-0 sm:border-l sm:pl-6">
              <Phone className="size-4 shrink-0 text-brand" aria-hidden />
              <a
                href={toTelHref(settings.phone)}
                className="font-semibold text-navy transition-colors hover:text-brand"
              >
                {settings.phone}
              </a>
            </li>
          </ul>

          <ul className="flex items-center gap-2">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-8 place-items-center rounded-full text-navy transition-all duration-300 hover:bg-brand hover:text-white"
                >
                  <Icon className="size-[0.9375rem]" />
                </a>
              </li>
            ))}
          </ul>
          </div>
        </div>
      </div>

      <HeaderNav
        services={services.map((s) => ({ slug: s.slug, title: s.title }))}
        emergencyHref={toTelHref(settings.emergencyPhone)}
        emergencyLabel={settings.emergencyPhone}
        drawerContent={<DrawerContent />}
      />
    </>
  );
}
