"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Page } from "@prisma/client";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { FormCard, FormFooter } from "@/components/admin/form-shell";
import { slugify } from "@/lib/slug";
import { deletePage, savePage, type PageState } from "./actions";

export function PageForm({ page }: { page: Page | null }) {
  const action = savePage.bind(null, page?.id ?? null);
  const [state, formAction, pending] = useActionState<PageState, FormData>(
    action,
    null,
  );

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(page?.slug));

  return (
    <form action={formAction} className="grid gap-6">
      <FormCard title="Sayfa bilgileri">
        <Field label="Başlık" htmlFor="title" required>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="KVKK Aydınlatma Metni"
          />
        </Field>

        <Field
          label="Bağlantı adresi"
          htmlFor="slug"
          hint={`Sitede: /${slug || "..."}`}
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
          label="Giriş metni"
          htmlFor="intro"
          hint="Başlığın hemen altında görünen kısa açıklama"
          className="sm:col-span-2"
        >
          <Textarea
            id="intro"
            name="intro"
            defaultValue={page?.intro ?? ""}
            rows={2}
            maxLength={300}
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-navy sm:col-span-2">
          <input
            type="checkbox"
            name="published"
            defaultChecked={page?.published ?? true}
            className="size-4.5 rounded border-line accent-[var(--color-brand)]"
          />
          Sitede yayında
        </label>
      </FormCard>

      <FormCard title="Sayfa içeriği" columns={1}>
        <Field
          label="Metin"
          htmlFor="content"
          hint="Boş satır paragraf ayırır. Başlık için ## , madde için - , vurgu için **kalın** kullanın."
        >
          <Textarea
            id="content"
            name="content"
            defaultValue={page?.content ?? ""}
            rows={20}
            className="min-h-[26rem] font-mono text-sm"
          />
        </Field>
      </FormCard>

      <FormCard title="Arama motoru (SEO)" columns={1}>
        <Field
          label="SEO başlığı"
          htmlFor="seoTitle"
          hint="Boş bırakılırsa sayfa başlığı kullanılır"
        >
          <Input
            id="seoTitle"
            name="seoTitle"
            defaultValue={page?.seoTitle ?? ""}
            maxLength={70}
          />
        </Field>

        <Field label="SEO açıklaması" htmlFor="seoDescription">
          <Textarea
            id="seoDescription"
            name="seoDescription"
            defaultValue={page?.seoDescription ?? ""}
            maxLength={170}
          />
        </Field>
      </FormCard>

      <FormFooter
        state={state}
        pending={pending}
        label={page ? "Değişiklikleri Kaydet" : "Sayfayı Oluştur"}
      />

      {page && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          <Link
            href={`/${page.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            <ExternalLink className="size-4" aria-hidden />
            Sayfayı sitede gör
          </Link>

          <DeletePageButton id={page.id} />
        </div>
      )}
    </form>
  );
}

function DeletePageButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const remove = async () => {
    setPending(true);
    setError(null);
    const result = await deletePage(id);
    setPending(false);

    if (!result.ok) {
      setError(result.message ?? "Silinemedi.");
      setConfirming(false);
    } else {
      router.push("/admin/sayfalar");
    }
  };

  if (!confirming) {
    return (
      <div className="text-right">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-danger"
        >
          <Trash2 className="size-4" aria-hidden />
          Sayfayı sil
        </button>
        {error && (
          <p role="alert" className="mt-2 max-w-sm text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-danger/30 bg-danger-soft p-4">
      <p className="text-sm font-medium text-navy">
        Bu sayfa kalıcı olarak silinecek. Emin misiniz?
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
