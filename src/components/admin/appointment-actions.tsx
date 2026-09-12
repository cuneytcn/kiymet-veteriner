"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@prisma/client";
import { Check, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { STATUS_LABELS } from "@/components/admin/status-badge";
import {
  deleteAppointment,
  updateAdminNote,
  updateAppointmentStatus,
} from "@/app/admin/(panel)/randevular/actions";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const STATUS_ORDER: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export function StatusSwitcher({
  id,
  current,
}: {
  id: string;
  current: AppointmentStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  const change = (status: AppointmentStatus) => {
    if (status === current) return;
    setError(null);

    startTransition(async () => {
      const result = await updateAppointmentStatus(id, status);
      if (!result.ok) {
        setError(result.message ?? "İşlem başarısız.");
        toast.error({ title: "Durum değiştirilemedi", description: result.message });
      } else {
        toast.success({ title: `Randevu "${STATUS_LABELS[status]}" olarak işaretlendi` });
        router.refresh();
      }
    });
  };

  return (
    <div>
      <p className="mb-2.5 text-sm font-semibold text-navy">Randevu durumu</p>
      <div className="flex flex-wrap gap-2">
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            disabled={pending}
            onClick={() => change(status)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60",
              status === current
                ? "border-brand bg-brand text-white"
                : "border-line bg-white text-navy hover:border-brand",
            )}
          >
            {status === current && <Check className="size-3.5" aria-hidden />}
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {pending && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Loader2 className="size-3 animate-spin" aria-hidden />
          Güncelleniyor...
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function AdminNoteEditor({
  id,
  initial,
}: {
  id: string;
  initial: string;
}) {
  const [note, setNote] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const save = () => {
    setSaved(false);
    startTransition(async () => {
      const result = await updateAdminNote(id, note);
      if (result.ok) {
        setSaved(true);
        toast.success({ title: "Klinik notu kaydedildi" });
      } else {
        toast.error({ title: "Not kaydedilemedi", description: result.message });
      }
    });
  };

  return (
    <div>
      <label
        htmlFor="adminNote"
        className="mb-2 block text-sm font-semibold text-navy"
      >
        Klinik notu
        <span className="ml-2 font-normal text-muted">
          (müşteriye gösterilmez)
        </span>
      </label>
      <Textarea
        id="adminNote"
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        placeholder="Örn. Müşteri arandı, 14:00'a kaydırıldı."
      />
      <div className="mt-3 flex items-center gap-3">
        <Button type="button" size="sm" onClick={save} disabled={pending}>
          {pending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Save aria-hidden />
          )}
          Notu Kaydet
        </Button>
        {saved && (
          <span className="text-sm font-medium text-success">
            Kaydedildi
          </span>
        )}
      </div>
    </div>
  );
}

export function DeleteAppointmentButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const remove = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteAppointment(id);
      if (!result.ok) {
        setError(result.message ?? "Silinemedi.");
        setConfirming(false);
      } else {
        router.push("/admin/randevular");
      }
    });
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden />
        Kaydı sil
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-danger/30 bg-danger-soft p-4">
      <p className="text-sm font-medium text-navy">
        Bu randevu kalıcı olarak silinecek. Emin misiniz?
      </p>
      <p className="mt-1 text-xs text-muted">
        Kayıt tutmak için silmek yerine &ldquo;İptal edildi&rdquo; durumunu
        kullanmanız önerilir.
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
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
