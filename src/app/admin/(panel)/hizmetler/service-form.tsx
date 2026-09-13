"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Service } from "@prisma/client";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormCard, FormFooter } from "@/components/admin/form-shell";
import { ICON_NAMES, ServiceIcon } from "@/components/ui/icon";
import { slugify } from "@/lib/slug";
import { deleteService, saveService, type ServiceState } from "./actions";
import { ImageField } from "@/components/admin/image-field";

export function ServiceForm({ service }: { service: Service | null }) {
  const action = saveService.bind(null, service?.id ?? null);
  const [state, formAction, pending] = useActionState<ServiceState, FormData>(
    action,
    null,
  );

  const [title, setTitle] = useState(service?.title ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(service?.slug));
  const [icon, setIcon] = useState(service?.icon ?? "stethoscope");

  return (
    <form action={formAction} className="grid gap-6">
      <FormCard title="Temel bilgiler">
        <Field label="Hizmet adı" htmlFor="title" required>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Örn. Genel Muayene"
          />
        </Field>

        <Field
          label="Bağlantı adresi"
          htmlFor="slug"
          hint={`Sitede: /hizmetler/${slug || "..."}`}
        >
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="genel-muayene"
          />
        </Field>

        <Field
          label="Kısa açıklama"
          htmlFor="shortDescription"
          hint="Kartlarda ve hizmet listesinde görünür"
          required
          className="sm:col-span-2"
        >
          <Textarea
            id="shortDescription"
            name="shortDescription"
            defaultValue={service?.shortDescription ?? ""}
            maxLength={300}
            placeholder="Dostunuzun genel sağlık durumunu değerlendiren kapsamlı muayene."
          />
        </Field>

        <Field label="İkon" htmlFor="icon" hint="Kart ve başlıkta kullanılır">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
              <ServiceIcon name={icon} className="size-5" />
            </span>
            <Select
              id="icon"
              name="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            >
              {ICON_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </div>
        </Field>

        <Field
          label="Sıra"
          htmlFor="order"
          hint="Küçük sayı önce gösterilir"
        >
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            max={999}
            defaultValue={service?.order ?? 0}
          />
        </Field>

        <ImageField
          name="coverImage"
          label="Kapak görseli"
          defaultValue={service?.coverImage}
          hint="Boş bırakırsanız varsayılan görsel kullanılır."
          className="sm:col-span-2"
        />

        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-navy sm:col-span-2">
          <input
            type="checkbox"
            name="published"
            defaultChecked={service?.published ?? true}
            className="size-4.5 rounded border-line accent-[var(--color-brand)]"
          />
          Sitede yayında
        </label>
      </FormCard>

      <FormCard title="Sayfa içeriği" columns={1}>
        <Field
          label="Detay metni"
          htmlFor="content"
          hint="Boş satır paragraf ayırır. Başlık için satır başına ## , madde için - yazın. **kalın** da çalışır."
        >
          <Textarea
            id="content"
            name="content"
            defaultValue={service?.content ?? ""}
            rows={14}
            className="min-h-72 font-mono text-sm"
          />
        </Field>

        <Field
          label="Kapsam maddeleri"
          htmlFor="highlights"
          hint="Her satır bir madde — hizmet sayfasında işaretli liste olarak görünür"
        >
          <Textarea
            id="highlights"
            name="highlights"
            defaultValue={service?.highlights.join("\n") ?? ""}
            rows={6}
            placeholder={"Detaylı fiziki muayene\nAteş ve nabız takibi\nAğız ve diş kontrolü"}
          />
        </Field>
      </FormCard>

      <FormCard title="Arama motoru (SEO)" columns={1}>
        <Field
          label="SEO başlığı"
          htmlFor="seoTitle"
          hint="Boş bırakılırsa hizmet adı kullanılır — en fazla 70 karakter"
        >
          <Input
            id="seoTitle"
            name="seoTitle"
            defaultValue={service?.seoTitle ?? ""}
            maxLength={70}
          />
        </Field>

        <Field
          label="SEO açıklaması"
          htmlFor="seoDescription"
          hint="Google'da başlığın altında görünen metin — en fazla 170 karakter"
        >
          <Textarea
            id="seoDescription"
            name="seoDescription"
            defaultValue={service?.seoDescription ?? ""}
            maxLength={170}
          />
        </Field>
      </FormCard>

      <FormFooter
        state={state}
        pending={pending}
        label={service ? "Değişiklikleri Kaydet" : "Hizmeti Ekle"}
      />

      {service && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          <Link
            href={`/hizmetler/${service.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            <ExternalLink className="size-4" aria-hidden />
            Sayfayı sitede gör
          </Link>

          <DeleteServiceButton id={service.id} />
        </div>
      )}
    </form>
  );
}

function DeleteServiceButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const remove = async () => {
    setPending(true);
    setError(null);
    const result = await deleteService(id);
    setPending(false);

    if (!result.ok) {
      setError(result.message ?? "Silinemedi.");
      setConfirming(false);
    } else {
      router.push("/admin/hizmetler");
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
          Hizmeti sil
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
        Bu hizmet kalıcı olarak silinecek. Emin misiniz?
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
          disabled={pending}
        >
          Vazgeç
        </Button>
      </div>
    </div>
  );
}
