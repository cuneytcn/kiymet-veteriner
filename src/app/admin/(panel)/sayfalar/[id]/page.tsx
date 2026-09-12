import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { PageForm } from "../page-form";

export const dynamic = "force-dynamic";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await db.page.findUnique({ where: { id } }).catch(() => null);

  if (!page) notFound();

  return (
    <>
      <PageHeader
        title={page.title}
        description={`/${page.slug}`}
        backHref="/admin/sayfalar"
      />
      <PageForm page={page} />
    </>
  );
}
