import { ChevronDown } from "lucide-react";
import type { Faq } from "@prisma/client";

/**
 * JS gerektirmeyen accordion — native <details>. Arama motoru içeriği her
 * koşulda görür, JS yüklenmeden de açılıp kapanır.
 */
export function FaqAccordion({ items }: { items: Faq[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-[48.75rem] gap-3">
      {items.map((faq) => (
        <details
          key={faq.id}
          className="group reveal rounded-xl bg-white shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-[1.375rem] py-[1.1875rem] font-head text-[1.0625rem] font-semibold transition-colors duration-300 group-open:text-brand [&::-webkit-details-marker]:hidden">
            {faq.question}
            <ChevronDown
              className="size-5 shrink-0 transition-transform duration-300 group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="px-[1.375rem] pb-5 text-[0.96875rem] leading-relaxed text-muted">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
