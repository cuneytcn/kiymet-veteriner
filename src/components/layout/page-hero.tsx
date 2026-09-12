import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/section";

export type Crumb = { name: string; href: string };

/** İç sayfaların üst bloğu — krem zemin, kırık daire ve sayfa yolu. */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <div className="relative -mt-25 overflow-hidden md:-mt-40 bg-[linear-gradient(160deg,#fdf1f5_0%,var(--color-cream)_38%,var(--color-cream)_100%)] pt-25 md:pt-40">
      <span
        className="pointer-events-none absolute -top-40 -right-40 size-[31.25rem] rounded-full bg-white/55"
        aria-hidden
      />

      <div className="container-page relative pt-11 pb-13 md:pt-14 md:pb-17">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Sayfa yolu" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
              {crumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight className="size-3.5 text-muted/60" aria-hidden />
                  )}
                  {i === crumbs.length - 1 ? (
                    <span aria-current="page" className="font-semibold text-navy">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-brand"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && <Eyebrow label={eyebrow} />}

        <h1 className="mt-3.5 max-w-3xl text-[1.9375rem] md:text-[2.75rem]">
          {title}
        </h1>

        {description && (
          <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
            {description}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
