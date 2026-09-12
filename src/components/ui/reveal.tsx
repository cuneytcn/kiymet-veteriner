"use client";

import { useEffect } from "react";

/**
 * Scroll reveal. Referanstaki AOS'un yerini tutar ama ek bağımlılık getirmez.
 *
 * `.reveal` sınıfı taşıyan her öğe görünür alana girdiğinde `.is-visible`
 * alır. JS çalışmazsa `.has-js` hiç eklenmediği için içerik baştan görünür —
 * yani arama motoru ve JS'siz ziyaretçi hiçbir şey kaybetmez.
 */
export function RevealProvider() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-js");

    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll<HTMLElement>(".reveal")
        .forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          // Aynı anda giren kartlar sırayla belirsin
          el.style.transitionDelay = `${(index % 3) * 90}ms`;
          el.classList.add("is-visible");
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    const observeAll = () =>
      document
        .querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")
        .forEach((el) => observer.observe(el));

    observeAll();

    // Sayfa geçişlerinde yeni gelen öğeleri de yakala
    const mutation = new MutationObserver(observeAll);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);

  return null;
}
