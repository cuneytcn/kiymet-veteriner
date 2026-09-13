"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Post } from "@prisma/client";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { FormCard, FormFooter } from "@/components/admin/form-shell";
import { slugify } from "@/lib/slug";
import { deletePost, savePost, type PostState } from "./actions";
import { ImageField } from "@/components/admin/image-field";

export function PostForm({ post }: { post: Post | null }) {
  const action = savePost.bind(null, post?.id ?? null);
  const [state, formAction, pending] = useActionState<PostState, FormData>(
    action,
    null,
  );

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));

  return (
    <form action={formAction} className="grid gap-6">
      <FormCard title="Yazı bilgileri">
        <Field label="Başlık" htmlFor="title" required className="sm:col-span-2">
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Kedilerde aşı takvimi: hangi aşı ne zaman yapılır?"
          />
        </Field>

        <Field
          label="Bağlantı adresi"
          htmlFor="slug"
          hint={`Sitede: /blog/${slug || "..."}`}
        >
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
        </Field>

        <Field
          label="Etiketler"
          htmlFor="tags"
          hint="Virgülle ayırın: kedi, aşı, bakım"
        >
          <Input id="tags" name="tags" defaultValue={post?.tags.join(", ") ?? ""} />
        </Field>

        <Field
          label="Özet"
          htmlFor="excerpt"
          hint="Blog listesinde ve paylaşımlarda görünür"
          required
          className="sm:col-span-2"
        >
          <Textarea
            id="excerpt"
            name="excerpt"
            defaultValue={post?.excerpt ?? ""}
            rows={2}
            maxLength={300}
          />
        </Field>

        <ImageField
          name="coverImage"
          label="Kapak görseli"
          defaultValue={post?.coverImage}
          className="sm:col-span-2"
        />

        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-navy sm:col-span-2">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post?.published ?? false}
            className="size-4.5 rounded border-line accent-[var(--color-brand)]"
          />
          Yayınla
          <span className="font-normal text-muted">
            (işaretlenmezse taslak olarak kalır, sitede görünmez)
          </span>
        </label>
      </FormCard>

      <FormCard title="Yazı içeriği" columns={1}>
        <Field
          label="Metin"
          htmlFor="content"
          hint="Boş satır paragraf ayırır. Başlık için ## , madde için - , vurgu için **kalın** kullanın."
          required
        >
          <Textarea
            id="content"
            name="content"
            defaultValue={post?.content ?? ""}
            rows={22}
            className="min-h-[28rem] font-mono text-sm"
          />
        </Field>
      </FormCard>

      <FormCard title="Arama motoru (SEO)" columns={1}>
        <Field
          label="SEO başlığı"
          htmlFor="seoTitle"
          hint="Boş bırakılırsa yazı başlığı kullanılır — en fazla 70 karakter"
        >
          <Input
            id="seoTitle"
            name="seoTitle"
            defaultValue={post?.seoTitle ?? ""}
            maxLength={70}
          />
        </Field>

        <Field
          label="SEO açıklaması"
          htmlFor="seoDescription"
          hint="Boş bırakılırsa özet kullanılır — en fazla 170 karakter"
        >
          <Textarea
            id="seoDescription"
            name="seoDescription"
            defaultValue={post?.seoDescription ?? ""}
            maxLength={170}
          />
        </Field>
      </FormCard>

      <FormFooter
        state={state}
        pending={pending}
        label={post ? "Değişiklikleri Kaydet" : "Yazıyı Oluştur"}
      />

      {post && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          {post.published ? (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              <ExternalLink className="size-4" aria-hidden />
              Yazıyı sitede gör
            </Link>
          ) : (
            <span className="text-sm text-muted">
              Yazı taslak durumda, sitede görünmüyor.
            </span>
          )}

          <DeletePostButton id={post.id} />
        </div>
      )}
    </form>
  );
}

function DeletePostButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const remove = async () => {
    setPending(true);
    const result = await deletePost(id);
    setPending(false);
    if (result.ok) router.push("/admin/blog");
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden />
        Yazıyı sil
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-danger/30 bg-danger-soft p-4">
      <p className="text-sm font-medium text-navy">
        Bu yazı kalıcı olarak silinecek. Emin misiniz?
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={remove}
          disabled={pending}
        >
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Evet, sil
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setConfirming(false)}
        >
          Vazgeç
        </Button>
      </div>
    </div>
  );
}
