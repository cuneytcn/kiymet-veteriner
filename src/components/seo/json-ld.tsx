import { getBusinessHours } from "@/lib/content";
import { WEEK_ORDER } from "@/lib/hours";
import { formatAddress, getSiteSettings, SITE_URL } from "@/lib/site";

const SCHEMA_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const CLINIC_ID = `${SITE_URL}/#veteriner`;

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify çıktısı bizim ürettiğimiz veriden geliyor; </script>
      // kaçışı XSS'e karşı ek güvence.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Sitenin ana kimlik kaydı. Google'ın yerel panelde ve haritada kliniği
 * tanıması için en belirleyici sinyal.
 */
export async function LocalBusinessJsonLd() {
  const [s, hours] = await Promise.all([getSiteSettings(), getBusinessHours()]);

  const openingHours = WEEK_ORDER.map((day) => {
    const h = hours.find((x) => x.dayOfWeek === day);
    if (!h || h.isClosed) return null;
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${SCHEMA_DAYS[day]}`,
      opens: h.openTime,
      closes: h.closeTime,
    };
  }).filter(Boolean);

  const sameAs = [s.instagramUrl, s.facebookUrl].filter(Boolean);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "VeterinaryCare",
        "@id": CLINIC_ID,
        name: s.clinicName,
        description: s.description,
        url: SITE_URL,
        telephone: s.phone,
        email: s.email,
        image: `${SITE_URL}/og.png`,
        priceRange: "₺₺",
        currenciesAccepted: "TRY",
        address: {
          "@type": "PostalAddress",
          streetAddress: s.addressLine,
          addressLocality: s.district,
          addressRegion: s.city,
          postalCode: s.postalCode,
          addressCountry: "TR",
        },
        ...(s.latitude && s.longitude
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: s.latitude,
                longitude: s.longitude,
              },
            }
          : {}),
        ...(s.mapsUrl ? { hasMap: s.mapsUrl } : {}),
        openingHoursSpecification: openingHours,
        ...(sameAs.length ? { sameAs } : {}),
        availableService: {
          "@type": "MedicalProcedure",
          name: "Acil veteriner müdahalesi",
          availableService: {
            "@type": "ServiceChannel",
            servicePhone: s.emergencyPhone,
            availableLanguage: "tr",
          },
        },
        potentialAction: {
          "@type": "ReserveAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/randevu`,
            inLanguage: "tr-TR",
            actionPlatform: [
              "https://schema.org/DesktopWebPlatform",
              "https://schema.org/MobileWebPlatform",
            ],
          },
          result: { "@type": "Reservation", name: "Veteriner randevusu" },
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${SITE_URL}${item.href}`,
        })),
      }}
    />
  );
}

export function FaqJsonLd({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }}
    />
  );
}

export async function ServiceJsonLd({
  name,
  description,
  slug,
}: {
  name: string;
  description: string;
  slug: string;
}) {
  const s = await getSiteSettings();

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        url: `${SITE_URL}/hizmetler/${slug}`,
        serviceType: name,
        provider: { "@id": CLINIC_ID },
        areaServed: {
          "@type": "City",
          name: s.city,
        },
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: `${SITE_URL}/randevu`,
          servicePhone: s.phone,
          serviceLocation: {
            "@type": "Place",
            name: s.clinicName,
            address: formatAddress(s),
          },
        },
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  image,
  clinicName,
}: {
  title: string;
  description: string;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  image?: string | null;
  clinicName: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url: `${SITE_URL}/blog/${slug}`,
        mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
        datePublished: (publishedAt ?? updatedAt).toISOString(),
        dateModified: updatedAt.toISOString(),
        ...(image ? { image: [image] } : {}),
        author: { "@type": "Organization", name: clinicName, "@id": CLINIC_ID },
        publisher: { "@id": CLINIC_ID },
      }}
    />
  );
}
