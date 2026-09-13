"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import type { User } from "@prisma/client";
import { Loader2, Plus, Shield, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  createUser,
  deleteUser,
  updateUserRole,
  type UserState,
} from "./actions";

type SafeUser = Pick<User, "id" | "name" | "email" | "role" | "createdAt">;

export function UserManager({
  users,
  currentUserId,
}: {
  users: SafeUser[];
  currentUserId: string;
}) {
  const [adding, setAdding] = useState(false);
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  const runAction = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        toast.error({ title: "İşlem yapılamadı", description: result.error });
      }
    });
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setAdding((v) => !v)}>
          {adding ? (
            <X className="size-4" aria-hidden />
          ) : (
            <Plus className="size-4" aria-hidden />
          )}
          {adding ? "Vazgeç" : "Kullanıcı ekle"}
        </Button>
      </div>

      {adding && <CreateForm onDone={() => setAdding(false)} />}

      <div className="overflow-hidden rounded-card border border-line bg-white">
        <ul className="divide-y divide-line">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            // Son yöneticinin yetkisi düşürülemez ve silinemez: panel sahipsiz kalmasın.
            const isLastAdmin = user.role === "ADMIN" && adminCount <= 1;

            return (
              <li
                key={user.id}
                className="flex flex-wrap items-center gap-4 p-4 sm:px-5"
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full",
                    user.role === "ADMIN"
                      ? "bg-brand-soft text-brand-dark"
                      : "bg-cream text-muted",
                  )}
                  aria-hidden
                >
                  {user.role === "ADMIN" ? (
                    <ShieldCheck className="size-5" />
                  ) : (
                    <Shield className="size-5" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy">
                    {user.name}
                    {isSelf && (
                      <span className="ml-2 rounded-pill bg-cream px-2 py-0.5 text-[0.6875rem] font-semibold text-muted">
                        siz
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted">{user.email}</p>
                </div>

                <Select
                  aria-label={`${user.name} yetkisi`}
                  value={user.role}
                  disabled={pending || isLastAdmin}
                  onChange={(event) =>
                    runAction(() =>
                      updateUserRole(
                        user.id,
                        event.target.value as "ADMIN" | "EDITOR",
                      ),
                    )
                  }
                  className="h-11 w-auto min-w-36"
                >
                  <option value="ADMIN">Yönetici</option>
                  <option value="EDITOR">Editör</option>
                </Select>

                <button
                  type="button"
                  disabled={pending || isSelf || isLastAdmin}
                  onClick={() => runAction(() => deleteUser(user.id))}
                  className="rounded-lg p-2.5 text-muted transition-colors hover:bg-cream hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`${user.name} hesabını sil`}
                  title={
                    isSelf
                      ? "Kendi hesabınızı silemezsiniz"
                      : isLastAdmin
                        ? "Son yönetici silinemez"
                        : "Hesabı sil"
                  }
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-xs text-muted">
        <strong className="font-semibold text-navy">Yönetici</strong> kullanıcı
        ekleyip silebilir ve yetki değiştirebilir.{" "}
        <strong className="font-semibold text-navy">Editör</strong> içerik ve
        randevuları yönetir, bu ekrana erişemez.
      </p>
    </div>
  );
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState<UserState, FormData>(
    createUser,
    null,
  );
  const toast = useToast();

  useEffect(() => {
    if (state?.ok) {
      toast.success({ title: state.message ?? "Kullanıcı eklendi" });
      onDone();
    } else if (state?.error) {
      toast.error({ title: "Eklenemedi", description: state.error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction}>
      <section className="rounded-card border border-line bg-white p-6">
        <h2 className="mb-5 font-head text-lg font-bold text-navy">
          Yeni kullanıcı
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ad Soyad" htmlFor="name" required>
            <Input id="name" name="name" />
          </Field>

          <Field label="E-posta" htmlFor="email" required>
            <Input id="email" name="email" type="email" />
          </Field>

          <Field
            label="Şifre"
            htmlFor="password"
            hint="En az 8 karakter. Kullanıcı sonradan kendisi değiştirebilir."
            required
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
            />
          </Field>

          <Field label="Yetki" htmlFor="role">
            <Select id="role" name="role" defaultValue="EDITOR">
              <option value="EDITOR">Editör</option>
              <option value="ADMIN">Yönetici</option>
            </Select>
          </Field>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <UserPlus className="size-4" aria-hidden />
              )}
              Kullanıcıyı ekle
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}
