import {
  Activity,
  Bone,
  Cat,
  Dog,
  Eye,
  FlaskConical,
  HeartPulse,
  Microscope,
  PawPrint,
  Pill,
  Scan,
  Scissors,
  Shield,
  Siren,
  Smile,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react";

/**
 * Admin panelinden ikon adı metin olarak seçilir; burada bileşene çevrilir.
 * Dinamik import yerine sabit eşleme — bundle boyutu öngörülebilir kalsın.
 */
const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  bone: Bone,
  cat: Cat,
  dog: Dog,
  eye: Eye,
  "flask-conical": FlaskConical,
  "heart-pulse": HeartPulse,
  microscope: Microscope,
  "paw-print": PawPrint,
  pill: Pill,
  scan: Scan,
  scissors: Scissors,
  shield: Shield,
  siren: Siren,
  smile: Smile,
  stethoscope: Stethoscope,
  syringe: Syringe,
};

/** Admin panelindeki ikon seçicisinin beslendiği liste. */
export const ICON_NAMES = Object.keys(ICONS).sort();

export function ServiceIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && ICONS[name]) || PawPrint;
  return <Icon className={className} aria-hidden />;
}
