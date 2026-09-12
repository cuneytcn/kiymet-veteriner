"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  duration: number;
};

type ToastInput = {
  title: string;
  description?: string;
  duration?: number;
};

type ToastApi = {
  success: (input: ToastInput) => void;
  error: (input: ToastInput) => void;
  info: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/**
 * Toast bildirimleri. Bildirimler canlı bölgeye yazılır:
 * hata `alert` (anında okunur), diğerleri `status` (sıraya girer).
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(1);

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, input: ToastInput) => {
      const id = nextId.current++;
      const duration = input.duration ?? (tone === "error" ? 7000 : 4500);

      setToasts((list) => [
        // Ekranı doldurmasın: en fazla üç bildirim
        ...list.slice(-2),
        { id, tone, title: input.title, description: input.description, duration },
      ]);
    },
    [],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (input) => push("success", input),
      error: (input) => push("error", input),
      info: (input) => push("info", input),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2.5 px-4 pb-4 sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-auto sm:items-end sm:pb-0"
            aria-live="polite"
            aria-atomic="false"
          >
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast, ToastProvider içinde kullanılmalı.");
  }

  return context;
}

const TONES: Record<
  ToastTone,
  { icon: typeof CheckCircle2; bar: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    bar: "bg-leaf",
    iconClass: "bg-leaf-soft text-leaf-dark",
  },
  error: {
    icon: AlertCircle,
    bar: "bg-danger",
    iconClass: "bg-danger-soft text-danger",
  },
  info: {
    icon: Info,
    bar: "bg-brand",
    iconClass: "bg-brand-soft text-brand",
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const { icon: Icon, bar, iconClass } = TONES[toast.tone];

  const close = useCallback(() => {
    setLeaving(true);
    // Çıkış animasyonu bitince listeden düş
    setTimeout(() => onDismiss(toast.id), 200);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    const timer = setTimeout(close, toast.duration);
    return () => clearTimeout(timer);
  }, [close, toast.duration]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-card bg-white shadow-lg",
        "motion-safe:transition-all motion-safe:duration-200",
        leaving
          ? "motion-safe:translate-y-2 motion-safe:opacity-0 sm:motion-safe:translate-x-3 sm:motion-safe:translate-y-0"
          : "motion-safe:animate-[toast-in_.25s_cubic-bezier(.2,.9,.3,1)]",
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", bar)} aria-hidden />

      <div className="flex items-start gap-3.5 py-4 pr-3 pl-5">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full",
            iconClass,
          )}
          aria-hidden
        >
          <Icon className="size-[1.125rem]" />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-head text-[0.9375rem] leading-snug font-bold text-navy">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-0.5 text-[0.875rem] leading-snug text-muted">
              {toast.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={close}
          className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-cream hover:text-navy"
          aria-label="Bildirimi kapat"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
