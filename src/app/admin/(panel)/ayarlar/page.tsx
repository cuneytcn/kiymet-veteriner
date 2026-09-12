import { PageHeader } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { siteDefaults } from "@/lib/site";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await db.siteSetting
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);

  return (
    <>
      <PageHeader
        title="Site Ayarları"
        description="Klinik bilgileri, iletişim, randevu kuralları ve SEO."
      />
      <SettingsForm settings={settings ?? siteDefaults} />
    </>
  );
}
