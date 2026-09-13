import type { NextConfig } from "next";

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
};

export default nextConfig;
