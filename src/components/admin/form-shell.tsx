"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export type FormState = { ok?: boolean; error?: string; message?: string } | null;

/** Panel formlarında tekrar eden kart başlığı. */
export function FormCard({
  title,
  description,
  children,
  columns = 2,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  columns?: 1 | 2;
}) {
  return (
    <section className="rounded-card border border-line bg-white p-6">
      <div className="mb-5">
        <h2 className="font-head text-lg font-bold text-navy">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        )}
      </div>
      <div className={columns === 2 ? "grid gap-5 sm:grid-cols-2" : "grid gap-5"}>
        {children}
      </div>
    </section>
  );
}

/** Kaydet butonu + başarı/hata mesajı. */
export function FormFooter({
  state,
  pending,
  label = "Kaydet",
  sticky = true,
}: {
  state: FormState;
  pending: boolean;
  label?: string;
  sticky?: boolean;
}) {
  const toast = useToast();

  // Sonuç geldiğinde bildirim göster. Hata ayrıca formun yanında da kalır,
  // çünkü kullanıcı düzeltmeyi yaparken görmeye devam etmeli.
  useEffect(() => {
    if (state?.ok) {
      toast.success({ title: state.message ?? "Kaydedildi." });
    } else if (state?.error) {
      toast.error({ title: "Kaydedilemedi", description: state.error });
    }
    // toast referansı sabit; yalnızca durum değişiminde tetiklensin
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <>
      {state?.error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-danger-soft p-3.5 text-sm font-medium text-danger"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}

      {state?.ok && (
        <p
          className="flex items-center gap-2 rounded-xl bg-success-soft p-3.5 text-sm font-medium text-success"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          {state.message ?? "Kaydedildi."}
        </p>
      )}

      <div
        className={
          sticky
            ? "sticky bottom-0 z-10 -mx-5 flex justify-end border-t border-line bg-white/95 px-5 py-4 backdrop-blur md:-mx-8 md:px-8"
            : undefined
        }
      >
        <Button type="submit" size="lg" disabled={pending} className="shadow-md">
          {pending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Save aria-hidden />
          )}
          {label}
        </Button>
      </div>
    </>
  );
}

/** Liste ekranlarında boş durum. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-line bg-white px-8 py-14 text-center">
      <h2 className="font-head text-lg font-bold text-navy">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Yayında / taslak rozeti. */
export function PublishBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-pill px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
        published
          ? "bg-success-soft text-success"
          : "bg-cream-2 text-muted"
      }`}
    >
      {published ? "Yayında" : "Taslak"}
    </span>
  );
}
