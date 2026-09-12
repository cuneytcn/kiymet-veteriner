"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Sayfanın en üstünde ilerleyen ince yükleme çizgisi.
 *
 * App Router'da yönlendirme olayları yayınlanmadığı için akış şöyle:
 * site içi bir bağlantıya tıklanınca başlatılır, adres değiştiğinde
 * tamamlanıp kaybolur.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    const start = () => {
      clearTimers();
      setVisible(true);
      setProgress(8);

      // Gerçek süreyi bilmiyoruz: hızlı başlayıp yavaşlayarak %90'a yaklaş
      [
        [90, 12],
        [260, 38],
        [600, 62],
        [1100, 78],
        [2000, 88],
      ].forEach(([delay, value]) => {
        timers.current.push(setTimeout(() => setProgress(value), delay));
      });
    };

    const onClick = (event: MouseEvent) => {
      // Yeni sekme / indirme / değiştirici tuş: sayfa geçişi olmaz
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      start();
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      clearTimers();
    };
  }, []);

  // Adres değişti: çizgiyi tamamla ve kaldır
  useEffect(() => {
    clearTimers();
    setProgress((current) => (current === 0 ? 0 : 100));

    const hide = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 320);

    return () => clearTimeout(hide);
  }, [pathname]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-100 h-1"
      role="presentation"
      aria-hidden
    >
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-brand via-brand to-sun shadow-[0_0_14px_rgb(255_72_128/0.7)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transition:
            "width .35s cubic-bezier(.25,.8,.3,1), opacity .3s ease-out",
        }}
      />
    </div>
  );
}
