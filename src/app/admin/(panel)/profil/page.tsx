import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/admin-shell";
import { requireUser } from "@/auth";
import { ProfileForms } from "./profile-forms";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const user = await requireUser();
  if (!user) redirect("/admin/giris");

  return (
    <>
      <PageHeader
        title="Hesabım"
        description="Giriş bilgilerinizi buradan güncelleyebilirsiniz."
      />
      <ProfileForms user={user} />
    </>
  );
}
