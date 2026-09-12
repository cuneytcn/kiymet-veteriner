import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { BackToTop } from "@/components/ui/back-to-top";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-pill focus:bg-brand focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
      >
        İçeriğe geç
      </a>

      <SiteHeader />

      <main id="icerik" className="flex-1 pb-20 sm:pb-0">
        {children}
      </main>

      <SiteFooter />
      <MobileActionBar />
      <BackToTop />
      <LocalBusinessJsonLd />
    </div>
  );
}
