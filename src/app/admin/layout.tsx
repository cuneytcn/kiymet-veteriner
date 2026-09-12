import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  // Panel hiçbir koşulda dizine eklenmemeli
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
