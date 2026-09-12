import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { PostForm } from "../post-form";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } }).catch(() => null);

  if (!post) notFound();

  return (
    <>
      <PageHeader
        title={post.title}
        description={post.published ? "Yayında" : "Taslak"}
        backHref="/admin/blog"
      />
      <PostForm post={post} />
    </>
  );
}
