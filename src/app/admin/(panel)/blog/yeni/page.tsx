import { PageHeader } from "@/components/admin/admin-shell";
import { PostForm } from "../post-form";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <>
      <PageHeader
        title="Yeni Yazı"
        description="Taslak olarak kaydedip sonra yayınlayabilirsiniz."
        backHref="/admin/blog"
      />
      <PostForm post={null} />
    </>
  );
}
