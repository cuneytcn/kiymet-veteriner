import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  WhatsappIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/ui/social-icons";
import { toWhatsappHref, type SiteSettings } from "./site";

export type SocialLink = {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
};

/**
 * Ayarlarda adresi girilmiş sosyal hesapları sıralar.
 * Adresi olmayan platform hiç gösterilmez — boşa tıklanan ikon olmasın.
 */
export function getSocialLinks(settings: SiteSettings): SocialLink[] {
  const entries: (SocialLink | false)[] = [
    Boolean(settings.instagramUrl) && {
      href: settings.instagramUrl,
      label: "Instagram",
      Icon: InstagramIcon,
    },
    Boolean(settings.facebookUrl) && {
      href: settings.facebookUrl,
      label: "Facebook",
      Icon: FacebookIcon,
    },
    Boolean(settings.youtubeUrl) && {
      href: settings.youtubeUrl,
      label: "YouTube",
      Icon: YoutubeIcon,
    },
    Boolean(settings.tiktokUrl) && {
      href: settings.tiktokUrl,
      label: "TikTok",
      Icon: TiktokIcon,
    },
    Boolean(settings.xUrl) && {
      href: settings.xUrl,
      label: "X",
      Icon: XIcon,
    },
    {
      href: toWhatsappHref(settings.whatsappNumber || settings.emergencyPhone),
      label: "WhatsApp",
      Icon: WhatsappIcon,
    },
  ];

  return entries.filter(Boolean) as SocialLink[];
}
