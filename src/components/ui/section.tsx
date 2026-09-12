import { cn } from "@/lib/utils";

export function Section({
  className,
  children,
  id,
  tone = "white",
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
  tone?: "white" | "cream" | "navy";
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-[4.625rem] md:py-section",
        tone === "cream" && "bg-cream",
        tone === "navy" && "bg-navy-deep text-muted-light",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Referanstaki `sec-title` bloğu: yuvarlak ikon + etiket, sonra başlık. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div
      className={cn(
        "max-w-[38.75rem]",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow
          label={eyebrow}
          className={align === "center" ? "justify-center" : undefined}
          tone={tone}
        />
      )}

      <Tag
        className={cn(
          "mt-3.5 text-[1.8125rem] md:text-[2.625rem]",
          tone === "dark" && "text-white",
        )}
      >
        {title}
      </Tag>

      {description && (
        <p
          className={cn(
            "mt-4 text-[1.03125rem] leading-relaxed",
            tone === "dark" ? "text-muted-light" : "text-muted",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export function Eyebrow({
  label,
  className,
  tone = "light",
}: {
  label: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-head text-[0.9375rem] font-semibold",
        tone === "dark" ? "text-white" : "text-brand",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-[2.125rem] place-items-center rounded-full",
          tone === "dark" ? "bg-white/20" : "bg-brand-soft",
        )}
        aria-hidden
      >
        <PawGlyph
          className={cn("size-4", tone === "dark" ? "fill-white" : "fill-brand")}
        />
      </span>
      {label}
    </span>
  );
}

/** Kurumsal logodaki pati — dört parmak ve yuvarlak avuç. */
export function PawGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden>
      <ellipse cx="88" cy="152" rx="48" ry="62" transform="rotate(-12 88 152)" />
      <ellipse cx="199" cy="76" rx="52" ry="68" />
      <ellipse cx="320" cy="76" rx="52" ry="68" />
      <ellipse cx="432" cy="152" rx="48" ry="62" transform="rotate(12 432 152)" />
      <path d="M190 236h130c74 0 134 60 134 134s-60 134-134 134H190c-74 0-134-60-134-134s60-134 134-134z" />
    </svg>
  );
}

/**
 * Logonun tam hali: avuçta sağlık haçı.
 * Renkleri kod tarafından geldiği için koyu zeminlerde de kullanılabilir —
 * PNG logonun lacivert yazısı footer'da okunmuyor.
 */
export function PawMedicalGlyph({
  className,
  crossColor = "#fff",
}: {
  className?: string;
  crossColor?: string;
}) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden>
      <ellipse cx="88" cy="152" rx="48" ry="62" transform="rotate(-12 88 152)" />
      <ellipse cx="199" cy="76" rx="52" ry="68" />
      <ellipse cx="320" cy="76" rx="52" ry="68" />
      <ellipse cx="432" cy="152" rx="48" ry="62" transform="rotate(12 432 152)" />
      <path d="M190 236h130c74 0 134 60 134 134s-60 134-134 134H190c-74 0-134-60-134-134s60-134 134-134z" />
      <path
        fill={crossColor}
        d="M236 300h40a16 16 0 0 1 16 16v34h34a16 16 0 0 1 16 16v40a16 16 0 0 1-16 16h-34v34a16 16 0 0 1-16 16h-40a16 16 0 0 1-16-16v-34h-34a16 16 0 0 1-16-16v-40a16 16 0 0 1 16-16h34v-34a16 16 0 0 1 16-16z"
      />
    </svg>
  );
}
