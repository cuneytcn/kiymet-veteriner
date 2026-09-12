import { PageHeader } from "@/components/admin/admin-shell";
import { PageForm } from "../page-form";

export const dynamic = "force-dynamic";

export default function NewPagePage() {
  return (
    <>
      <PageHeader
        title="Yeni Sayfa"
        description="Oluşturduğunuz sayfa /adres biçiminde yayına girer."
        backHref="/admin/sayfalar"
      />
      <PageForm page={null} />
    </>
  );
}
