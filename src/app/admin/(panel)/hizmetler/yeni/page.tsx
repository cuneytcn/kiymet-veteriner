import { PageHeader } from "@/components/admin/admin-shell";
import { ServiceForm } from "../service-form";

export const dynamic = "force-dynamic";

export default function NewServicePage() {
  return (
    <>
      <PageHeader
        title="Yeni Hizmet"
        description="Eklediğiniz hizmet ana sayfada, menüde ve randevu formunda otomatik görünür."
        backHref="/admin/hizmetler"
      />
      <ServiceForm service={null} />
    </>
  );
}
