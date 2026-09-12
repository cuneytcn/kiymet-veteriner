import { CalendarPlus, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { getSiteSettings, toTelHref, toWhatsappHref } from "@/lib/site";

/**
 * Mobilde ekranın altına sabitlenen eylem çubuğu. Veteriner aramalarının
 * büyük kısmı telefondan geldiği için ara/WhatsApp/randevu hep erişilebilir.
 */
export async function MobileActionBar() {
  const settings = await getSiteSettings();

  const items = [
    {
      href: toTelHref(settings.phone),
      label: "Ara",
      icon: Phone,
      className: "text-navy",
      external: true,
    },
    {
      href: toWhatsappHref(
        settings.whatsappNumber || settings.emergencyPhone,
        "Merhaba, bilgi almak istiyorum.",
      ),
      label: "WhatsApp",
      icon: MessageCircle,
      className: "text-navy",
      external: true,
    },
    {
      href: "/randevu",
      label: "Randevu",
      icon: CalendarPlus,
      className: "text-brand",
      external: false,
    },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
      <div className="grid grid-cols-3">
        {items.map(({ href, label, icon: Icon, className, external }) => {
          const content = (
            <>
              <Icon className="size-5" aria-hidden />
              <span className="text-[0.6875rem] font-semibold">{label}</span>
            </>
          );
          const cls = `flex flex-col items-center justify-center gap-1 py-2.5 transition-colors active:bg-cream ${className}`;

          return external ? (
            <a key={label} href={href} className={cls}>
              {content}
            </a>
          ) : (
            <Link key={label} href={href} className={cls}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
