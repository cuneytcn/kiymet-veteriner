import type { NextConfig } from "next";

/** Sitenin tek kanonik adresi. Diğer host'lar buraya yönlendirilir. */
const CANONICAL_ORIGIN = "https://www.kiymetveteriner.com";

/**
 * Kanonik olmayan host'lar. Aynı içerik birden fazla adresten yayınlanırsa
 * arama motoru bunları kopya içerik sayıp sıralama sinyallerini böler.
 *
 * Preview dağıtımlarının adresleri (kiymet-veteriner-<hash>-...vercel.app)
 * bilerek listede yok; olsaydı her preview canlıya zıplar, test edilemezdi.
 */
const REDIRECTED_HOSTS = ["kiymetveteriner.com", "kiymet-veteriner.vercel.app"];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Panelden yüklenen görseller Vercel Blob'da durur. Kötüye kullanımı
        // önlemek için joker yerine yalnızca bu projenin deposuna izin veriyoruz.
        protocol: "https",
        hostname: "6xbbedrhsagu35eb.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },

  async redirects() {
    // permanent: true → 308. Next, isteğin metodunu koruduğu için 301 yerine
    // 308 kullanıyor; arama motorları ikisini de kalıcı yönlendirme sayar.
    return REDIRECTED_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${CANONICAL_ORIGIN}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
