"use client";

import { useActionState, useEffect } from "react";
import { KeyRound, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { changePassword, updateProfile, type ProfileState } from "./actions";

export function ProfileForms({
  user,
}: {
  user: { name: string; email: string; role: string };
}) {
  return (
    <div className="grid gap-6">
      <IdentityForm user={user} />
      <PasswordForm />
    </div>
  );
}

function IdentityForm({ user }: { user: { name: string; email: string } }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    null,
  );
  const toast = useToast();

  useEffect(() => {
    if (state?.ok) toast.success({ title: state.message ?? "Kaydedildi" });
    else if (state?.error)
      toast.error({ title: "Kaydedilemedi", description: state.error });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction}>
      <Card title="Hesap bilgileri">
        <Field label="Ad Soyad" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={user.name} />
        </Field>

        <Field
          label="E-posta"
          htmlFor="email"
          hint="Panele bu adresle giriş yaparsınız. Değiştirirseniz yeniden giriş istenir."
          required
        >
          <Input id="email" name="email" type="email" defaultValue={user.email} />
        </Field>

        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="size-4" aria-hidden />
            )}
            Kaydet
          </Button>
        </div>
      </Card>
    </form>
  );
}

function PasswordForm() {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    changePassword,
    null,
  );
  const toast = useToast();

  useEffect(() => {
    if (state?.error)
      toast.error({ title: "Şifre değiştirilemedi", description: state.error });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction}>
      <Card title="Şifre değiştir">
        <Field label="Mevcut şifreniz" htmlFor="current" required>
          <Input id="current" name="current" type="password" autoComplete="current-password" />
        </Field>

        <span className="hidden sm:block" aria-hidden />

        <Field
          label="Yeni şifre"
          htmlFor="next"
          hint="En az 8 karakter."
          required
        >
          <Input id="next" name="next" type="password" autoComplete="new-password" />
        </Field>

        <Field label="Yeni şifre (tekrar)" htmlFor="repeat" required>
          <Input id="repeat" name="repeat" type="password" autoComplete="new-password" />
        </Field>

        <div className="sm:col-span-2">
          <p className="mb-3 text-xs text-muted">
            Şifre değiştikten sonra güvenlik için oturumunuz kapatılır ve yeniden
            giriş yapmanız istenir.
          </p>

          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <KeyRound className="size-4" aria-hidden />
            )}
            Şifreyi değiştir
          </Button>
        </div>
      </Card>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-white p-6">
      <h2 className="mb-5 font-head text-lg font-bold text-navy">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
