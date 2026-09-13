"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { TeamMember } from "@prisma/client";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { EmptyState, FormFooter, PublishBadge } from "@/components/admin/form-shell";
import {
  deleteMember,
  saveMember,
  toggleMemberPublished,
  type TeamState,
} from "./actions";
import { ImageField } from "@/components/admin/image-field";

export function TeamManager({ members }: { members: TeamMember[] }) {
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [adding, setAdding] = useState(false);

  const close = () => {
    setEditing(null);
    setAdding(false);
  };

  return (
    <div className="grid gap-6">
      {(adding || editing) && (
        <MemberForm key={editing?.id ?? "new"} member={editing} onDone={close} />
      )}

      {!adding && !editing && (
        <div>
          <Button type="button" onClick={() => setAdding(true)} size="md">
            <Plus aria-hidden />
            Ekip Üyesi Ekle
          </Button>
        </div>
      )}

      {members.length === 0 ? (
        <EmptyState
          title="Ekip listesi boş"
          description="Veteriner hekimlerinizi ve klinik personelinizi ekleyin. Ekip bölümü, üye eklenene kadar hakkımızda sayfasında görünmez."
        />
      ) : (
        <ul className="grid gap-2">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onEdit={() => {
                setAdding(false);
                setEditing(member);
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function MemberRow({
  member,
  onEdit,
}: {
  member: TeamMember;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  return (
    <li className="rounded-card border border-line bg-white p-4">
      <div className="flex flex-wrap items-center gap-4">
        {member.photo ? (
          <span className="relative size-14 shrink-0 overflow-hidden rounded-full">
            <Image
              src={member.photo}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          </span>
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-soft font-head text-xl font-bold text-brand">
            {member.name.charAt(0)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="font-head font-bold text-navy">{member.name}</p>
          <p className="text-sm text-brand">{member.title}</p>
          {member.bio && (
            <p className="mt-1 line-clamp-1 text-sm text-muted">{member.bio}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm text-muted">Sıra: {member.order}</span>
          <PublishBadge published={member.published} />

          <button
            type="button"
            onClick={() =>
              run(() => toggleMemberPublished(member.id, !member.published))
            }
            disabled={pending}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-cream hover:text-navy"
            title={member.published ? "Yayından kaldır" : "Yayına al"}
            aria-label={member.published ? "Yayından kaldır" : "Yayına al"}
          >
            {member.published ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-cream hover:text-brand"
            title="Düzenle"
            aria-label="Düzenle"
          >
            <Pencil className="size-4" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
            title="Sil"
            aria-label="Sil"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {confirming && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-danger-soft p-3.5">
          <p className="flex-1 text-sm font-medium text-navy">
            {member.name} listeden silinecek. Emin misiniz?
          </p>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => run(() => deleteMember(member.id))}
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

function MemberForm({
  member,
  onDone,
}: {
  member: TeamMember | null;
  onDone: () => void;
}) {
  const action = saveMember.bind(null, member?.id ?? null);
  const [state, formAction, pending] = useActionState<TeamState, FormData>(
    action,
    null,
  );
  const router = useRouter();

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
          {member ? "Ekip üyesini düzenle" : "Yeni ekip üyesi"}
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ad soyad" htmlFor="name" required>
          <Input
            id="name"
            name="name"
            defaultValue={member?.name ?? ""}
            placeholder="Vet. Hek. Ayşe Yılmaz"
          />
        </Field>

        <Field label="Unvan" htmlFor="title" required>
          <Input
            id="title"
            name="title"
            defaultValue={member?.title ?? ""}
            placeholder="Veteriner Hekim"
          />
        </Field>

        <ImageField
          name="photo"
          label="Fotoğraf"
          defaultValue={member?.photo}
        />

        <Field label="Sıra" htmlFor="order" hint="Küçük sayı önce gösterilir">
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={member?.order ?? 0}
          />
        </Field>

        <Field
          label="Kısa tanıtım"
          htmlFor="bio"
          hint="Uzmanlık alanı, deneyim — birkaç cümle"
          className="sm:col-span-2"
        >
          <Textarea
            id="bio"
            name="bio"
            defaultValue={member?.bio ?? ""}
            rows={3}
            maxLength={600}
          />
        </Field>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-navy">
        <input
          type="checkbox"
          name="published"
          defaultChecked={member?.published ?? true}
          className="size-4.5 rounded border-line accent-[var(--color-brand)]"
        />
        Hakkımızda sayfasında görünsün
      </label>

      <FormFooter
        state={state}
        pending={pending}
        label={member ? "Güncelle" : "Ekle"}
        sticky={false}
      />
    </form>
  );
}
