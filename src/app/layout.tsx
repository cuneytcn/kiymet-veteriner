import type { Metadata, Viewport } from "next";
import { Open_Sans, Poppins } from "next/font/google";
import { getSiteSettings, SITE_URL } from "@/lib/site";
import { RevealProvider } from "@/components/ui/reveal";
import { ToastProvider } from "@/components/ui/toast";
import { RouteProgress } from "@/components/ui/route-progress";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ff4880",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: s.seoTitle || s.clinicName,
      template: `%s | ${s.clinicName}`,
    },
    description: s.seoDescription || s.description,
    applicationName: s.clinicName,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: SITE_URL,
      siteName: s.clinicName,
      title: s.seoTitle || s.clinicName,
      description: s.seoDescription || s.description,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: s.clinicName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: s.seoTitle || s.clinicName,
      description: s.seoDescription || s.description,
      images: ["/og.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    verification: s.googleVerification
      ? { google: s.googleVerification }
      : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${openSans.variable} ${poppins.variable}`}>
      <body className="min-h-dvh antialiased">
        <RouteProgress />
        <RevealProvider />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
