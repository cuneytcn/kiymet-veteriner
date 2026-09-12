"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { HeaderDrawer } from "./header-drawer";

export type NavService = { slug: string; title: string };

type Props = {
  services: NavService[];
  emergencyHref: string;
  emergencyLabel: string;
  /** Nokta düğmesinin açtığı panelin içeriği (sunucuda hazırlanır) */
  drawerContent: React.ReactNode;
};

const links = [
  { href: "/", label: "Ana Sayfa", exact: true },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/fiyatlandirma", label: "Fiyatlar" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
];

export function HeaderNav({
  services,
  emergencyHref,
  emergencyLabel,
  drawerContent,
}: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /**
   * Sayfa başındayken başlık, krem zemin üzerinde duran beyaz bir kutu.
   * Kaydırınca kutu ekranın üstüne yapışıp gölge alıyor.
   */
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const servicesActive = pathname.startsWith("/hizmetler");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow] duration-300 ease-out",
        stuck ? "bg-white shadow-[0_6px_26px_rgb(34_37_74/0.1)]" : "bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full items-center justify-between gap-8 bg-white",
          "transition-[height,max-width,padding,box-shadow] duration-300 ease-out",
          stuck
            ? "h-[4.75rem] max-w-[88rem] rounded-none px-5 shadow-none md:px-8"
            : "h-[6.25rem] max-w-[86rem] rounded-2xl px-6 shadow-[0_8px_30px_rgb(34_37_74/0.08)] md:px-9",
          // Menü açıkken alt köşeler düz: panel başlığın devamı gibi görünsün
          mobileOpen && "rounded-b-none shadow-none",
        )}
      >
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.02]"
          aria-label="Kıymet Veteriner Kliniği — ana sayfa"
        >
          <Image
            src="/img/logo.webp"
            alt="Kıymet Veteriner Kliniği"
            width={600}
            height={201}
            priority
            className={cn(
              "w-auto transition-all duration-300",
              stuck ? "h-11" : "h-13",
            )}
          />
        </Link>

        <nav className="hidden items-center xl:flex" aria-label="Ana menü">
          {links.slice(0, 1).map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              active={isActive(l.href, l.exact)}
            >
              {l.label}
            </NavLink>
          ))}

          <div className="group/nav relative">
            <NavLink href="/hizmetler" active={servicesActive} expandable>
              Hizmetler
            </NavLink>

            {services.length > 0 && (
              <div className="invisible absolute top-full left-3 min-w-[15rem] translate-y-3 pt-1 opacity-0 transition-all duration-300 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
                <ul className="rounded-xl bg-white p-2.5 shadow-md">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/hizmetler/${s.slug}`}
                        className="block rounded-lg px-3.5 py-2.5 font-head text-[0.9375rem] font-semibold text-navy transition-all duration-200 hover:bg-brand-soft hover:pl-5 hover:text-brand"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {links.slice(1).map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              active={isActive(l.href, l.exact)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3.5">
          <ButtonLink href="/randevu" size="md" className="hidden sm:inline-flex">
            Randevu Al
          </ButtonLink>

          {/* Referanstaki nokta düğmesi — klinik bilgileri panelini açar */}
          <HeaderDrawer>{drawerContent}</HeaderDrawer>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="grid size-[2.875rem] place-items-center rounded-[0.625rem] bg-navy text-white xl:hidden"
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="size-[1.375rem]" aria-hidden />
            ) : (
              <Menu className="size-[1.375rem]" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-line bg-white xl:hidden",
            // Menü başlığın tam altından başlamalı; başlık yapışınca kısalıyor
            stuck ? "top-[4.75rem]" : "top-[6.25rem]",
          )}
        >
          <nav className="container-page py-7" aria-label="Mobil menü">
            <p className="mb-3 font-head text-xs font-semibold tracking-[0.14em] text-brand uppercase">
              Hizmetlerimiz
            </p>
            <ul className="mb-7 grid gap-1">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/hizmetler/${s.slug}`}
                    className="block rounded-xl px-3.5 py-3 font-head text-[1.0625rem] font-semibold text-navy transition-colors hover:bg-brand-soft hover:text-brand"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mb-3 font-head text-xs font-semibold tracking-[0.14em] text-brand uppercase">
              Klinik
            </p>
            <ul className="grid gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block rounded-xl px-3.5 py-3 font-head text-[1.0625rem] font-semibold text-navy transition-colors hover:bg-brand-soft hover:text-brand"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-3">
              <ButtonLink href="/randevu" size="lg" block>
                Online Randevu Al
              </ButtonLink>
              <a
                href={emergencyHref}
                className="flex h-14 items-center justify-center gap-2 rounded-pill bg-navy-deep px-7 font-head font-semibold text-white"
              >
                <Phone className="size-[1.125rem]" aria-hidden />
                Acil Hat: {emergencyLabel}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

/**
 * Menü bağlantısı. Alt menüsü olanlar referanstaki gibi "+" ile işaretli:
 * hover'da 45° dönüp çarpıya yaklaşıyor.
 */
function NavLink({
  href,
  active,
  expandable,
  children,
}: {
  href: string;
  active: boolean;
  expandable?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/link relative inline-flex items-center gap-1.5 px-4 py-3 font-head text-base font-semibold whitespace-nowrap transition-colors duration-300",
        active ? "text-brand" : "text-navy hover:text-brand",
      )}
    >
      {children}

      {expandable && (
        <span
          className="text-[1.0625rem] leading-none font-normal transition-transform duration-300 group-hover/nav:rotate-45"
          aria-hidden
        >
          +
        </span>
      )}

      <span
        className={cn(
          "absolute inset-x-4 bottom-1.5 h-0.5 origin-center rounded-sm bg-brand transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]",
          active
            ? "scale-x-100"
            : "scale-x-0 group-hover/link:scale-x-100 group-hover/nav:scale-x-100",
        )}
        aria-hidden
      />
    </Link>
  );
}
