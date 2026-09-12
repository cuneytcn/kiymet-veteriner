"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sayfa başına dönüş düğmesi. Bir ekran boyu kaydırıldıktan sonra beliriyor.
 * Mobilde alttaki sabit eylem çubuğuyla çakışmaması için yukarıda duruyor.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Sayfanın başına dön"
      title="Yukarı çık"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "group/top fixed right-5 z-40 grid size-12 place-items-center rounded-full",
        "bg-brand text-white shadow-[0_8px_24px_rgb(255_72_128/0.4)]",
        "transition-all duration-300 hover:bg-brand-dark hover:shadow-[0_10px_28px_rgb(255_72_128/0.5)]",
        "bottom-24 sm:right-7 sm:bottom-7",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp
        className="size-5 transition-transform duration-300 group-hover/top:-translate-y-0.5"
        aria-hidden
      />
    </button>
  );
}
