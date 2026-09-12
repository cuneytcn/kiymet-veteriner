"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <form
      action={formAction}
      className="grid gap-5 rounded-card border border-line bg-white p-7 shadow-sm"
    >
      <Field label="E-posta" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="ornek@eposta.com"
        />
      </Field>

      <Field label="Şifre" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </Field>

      {state?.error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-danger-soft p-3 text-sm font-medium text-danger"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Giriş yapılıyor...
          </>
        ) : (
          "Giriş Yap"
        )}
      </Button>
    </form>
  );
}
