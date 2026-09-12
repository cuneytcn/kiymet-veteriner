"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Closure } from "@prisma/client";
import { AlertCircle, CalendarOff, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { formatDateKeyTr, utcDateToKey } from "@/lib/hours";
import { useToast } from "@/components/ui/toast";
import { addClosure, removeClosure, type ClosureState } from "./actions";

export function ClosureManager({ closures }: { closures: Closure[] }) {
  const [state, formAction, pending] = useActionState<ClosureState, FormData>(
    addClosure,
    null,
  );
  const [allDay, setAllDay] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (state?.ok) toast.success({ title: "Kapanış kaydedildi" });
    else if (state?.error) toast.error({ title: "Kaydedilemedi", description: state.error });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
      <form
        action={formAction}
        className="grid gap-5 rounded-card border border-line bg-white p-6"
      >
        <h2 className="font-head text-lg font-bold text-navy">
          Kapanış ekle
        </h2>

        <Field label="Tarih" htmlFor="date" required>
          <Input id="date" name="date" type="date" required />
        </Field>

        <Field
          label="Sebep"
          htmlFor="reason"
          hint="Sitede ziyaretçiye gösterilir"
        >
          <Input
            id="reason"
            name="reason"
            placeholder="Örn. Resmi tatil, Kurban Bayramı"
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-navy">
          <input
            type="checkbox"
            name="allDay"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="size-4.5 rounded border-line accent-[var(--color-brand)]"
          />
          Gün boyu kapalı
        </label>

        {!allDay && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Açılış" htmlFor="openTime" required>
              <Input id="openTime" name="openTime" type="time" />
            </Field>
            <Field label="Kapanış" htmlFor="closeTime" required>
              <Input id="closeTime" name="closeTime" type="time" />
            </Field>
          </div>
        )}

        {state?.error && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-xl bg-danger-soft p-3 text-sm font-medium text-danger"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {state.error}
          </p>
        )}

        {state?.ok && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-xl bg-success-soft p-3 text-sm font-medium text-success"
          >
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            Kapanış kaydedildi.
          </p>
        )}

        <Button type="submit" block disabled={pending}>
          {pending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Plus aria-hidden />
          )}
          Ekle
        </Button>
      </form>

      <div>
        <h2 className="mb-4 font-head text-lg font-bold text-navy">
          Planlanmış kapanışlar
        </h2>

        {closures.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-white p-10 text-center text-muted">
            Planlanmış kapanış yok. Tatil ve izin günlerini buradan ekleyin;
            o günler randevuya kapanır.
          </p>
        ) : (
          <ul className="grid gap-2">
            {closures.map((closure) => (
              <ClosureRow key={closure.id} closure={closure} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ClosureRow({ closure }: { closure: Closure }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const remove = () =>
    startTransition(async () => {
      await removeClosure(closure.id);
      router.refresh();
    });

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-white p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
        <CalendarOff className="size-5" aria-hidden />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-navy">
          {formatDateKeyTr(utcDateToKey(closure.date))}
        </span>
        <span className="block text-sm text-muted">
          {closure.allDay
            ? "Gün boyu kapalı"
            : `Kısıtlı: ${closure.openTime} - ${closure.closeTime}`}
          {closure.reason ? ` · ${closure.reason}` : ""}
        </span>
      </span>

      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-danger disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="size-4" aria-hidden />
        )}
        Kaldır
      </button>
    </li>
  );
}
