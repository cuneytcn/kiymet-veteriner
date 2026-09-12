"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Referanstaki nokta düğmesi ve açtığı yan panel.
 * Panel klavyeyle kullanılabilir: Esc kapatır, odak panel içinde döner,
 * kapanınca odak düğmeye geri gelir.
 */
export function HeaderDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Açıkken: sayfa kaymasın, Esc kapatsın, odak panelde kalsın
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Klinik bilgilerini aç"
        aria-expanded={open}
        className="group/dots hidden cursor-pointer grid-cols-3 gap-2 rounded-lg p-1.5 transition-transform duration-300 hover:scale-105 lg:grid"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-2.5 rounded-full transition-colors duration-300",
              // Köşegen boyunca koyulaşan başlangıç dağılımı
              [0, 1, 3, 5, 7, 8].includes(i) ? "bg-brand-line" : "bg-brand",
              "group-hover/dots:bg-brand",
            )}
            aria-hidden
          />
        ))}
      </button>

      {/* Arka plan karartması */}
      <div
        className={cn(
          "fixed inset-0 z-60 bg-navy-deep/50 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Klinik bilgileri"
        tabIndex={-1}
        className={cn(
          "fixed inset-y-0 right-0 z-70 w-[22rem] max-w-[88vw] overflow-y-auto bg-white shadow-lg",
          "transition-transform duration-400 ease-out focus:outline-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Paneli kapat"
          className="absolute top-5 right-5 grid size-10 place-items-center rounded-full bg-cream text-navy transition-colors hover:bg-brand hover:text-white"
        >
          <X className="size-5" aria-hidden />
        </button>

        <div className="px-7 py-8">{children}</div>
      </div>
    </>
  );
}
