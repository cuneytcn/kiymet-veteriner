"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Faq } from "@prisma/client";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormFooter, EmptyState, PublishBadge } from "@/components/admin/form-shell";
import {
  deleteFaq,
  saveFaq,
  toggleFaqPublished,
  type FaqState,
} from "./actions";

const GROUPS = [
  { value: "genel", label: "Ana sayfa" },
  { value: "randevu", label: "Randevu sayfası" },
];

export function FaqManager({ faqs }: { faqs: Faq[] }) {
  const [editing, setEditing] = useState<Faq | null>(null);
  const [adding, setAdding] = useState(false);

  const close = () => {
    setEditing(null);
    setAdding(false);
  };

  return (
    <div className="grid gap-6">
      {(adding || editing) && (
        <FaqForm key={editing?.id ?? "new"} faq={editing} onDone={close} />
      )}

      {!adding && !editing && (
        <div>
          <Button type="button" onClick={() => setAdding(true)} size="md">
            <Plus aria-hidden />
            Yeni Soru Ekle
          </Button>
        </div>
      )}

      {faqs.length === 0 ? (
        <EmptyState
          title="Henüz soru yok"
          description="Müşterilerin sık sorduğu soruları ekleyin; ana sayfada ve randevu sayfasında görünür, Google'da da zengin sonuç olarak çıkabilir."
        />
      ) : (
        <div className="grid gap-6">
          {GROUPS.map((group) => {
            const items = faqs.filter((f) => f.group === group.value);
            if (items.length === 0) return null;

            return (
              <section key={group.value}>
                <h2 className="mb-3 font-head text-sm font-semibold tracking-wide text-muted uppercase">
                  {group.label} ({items.length})
                </h2>

                <ul className="grid gap-2">
                  {items.map((faq) => (
                    <FaqRow
                      key={faq.id}
                      faq={faq}
                      onEdit={() => {
                        setAdding(false);
                        setEditing(faq);
                      }}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FaqRow({ faq, onEdit }: { faq: Faq; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  const toggle = () =>
    startTransition(async () => {
      await toggleFaqPublished(faq.id, !faq.published);
      router.refresh();
    });

  const remove = () =>
    startTransition(async () => {
      await deleteFaq(faq.id);
      router.refresh();
    });

  return (
    <li className="rounded-card border border-line bg-white p-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-head font-bold text-navy">{faq.question}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{faq.answer}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm text-muted">Sıra: {faq.order}</span>
          <PublishBadge published={faq.published} />

          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-cream hover:text-navy"
            aria-label={faq.published ? "Yayından kaldır" : "Yayına al"}
            title={faq.published ? "Yayından kaldır" : "Yayına al"}
          >
            {faq.published ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-cream hover:text-brand"
            aria-label="Düzenle"
            title="Düzenle"
          >
            <Pencil className="size-4" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
            aria-label="Sil"
            title="Sil"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {confirming && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-danger-soft p-3.5">
          <p className="flex-1 text-sm font-medium text-navy">
            Bu soru silinecek. Emin misiniz?
          </p>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={remove}
            disabled={pending}
          >
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            Sil
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
      )}
    </li>
  );
}

function FaqForm({ faq, onDone }: { faq: Faq | null; onDone: () => void }) {
  const action = saveFaq.bind(null, faq?.id ?? null);
  const [state, formAction, pending] = useActionState<FaqState, FormData>(
    action,
    null,
  );
  const router = useRouter();

  // Kaydedildiğinde başarı mesajı görünsün, sonra liste tazelenip form kapansın
  useEffect(() => {
    if (!state?.ok) return;

    const timer = setTimeout(() => {
      router.refresh();
      onDone();
    }, 700);

    return () => clearTimeout(timer);
  }, [state, router, onDone]);

  return (
    <form
      action={formAction}
      className="grid gap-5 rounded-card border-2 border-brand-line bg-white p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-head text-lg font-bold text-navy">
          {faq ? "Soruyu düzenle" : "Yeni soru"}
        </h2>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-cream hover:text-navy"
          aria-label="Kapat"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <Field label="Soru" htmlFor="question" required>
        <Input
          id="question"
          name="question"
          defaultValue={faq?.question ?? ""}
          placeholder="Randevusuz gelebilir miyim?"
        />
      </Field>

      <Field label="Cevap" htmlFor="answer" required>
        <Textarea
          id="answer"
          name="answer"
          defaultValue={faq?.answer ?? ""}
          rows={5}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Nerede görünsün" htmlFor="group">
          <Select id="group" name="group" defaultValue={faq?.group ?? "genel"}>
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Sıra" htmlFor="order">
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={faq?.order ?? 0}
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5 self-end pb-3 text-sm font-medium text-navy">
          <input
            type="checkbox"
            name="published"
            defaultChecked={faq?.published ?? true}
            className="size-4.5 rounded border-line accent-[var(--color-brand)]"
          />
          Yayında
        </label>
      </div>

      <FormFooter
        state={state}
        pending={pending}
        label={faq ? "Güncelle" : "Ekle"}
        sticky={false}
      />
    </form>
  );
}
