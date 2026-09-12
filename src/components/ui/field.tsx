import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-xl border bg-white px-4 text-[0.9375rem] text-navy transition-colors placeholder:text-muted focus:border-brand focus:outline-none disabled:bg-cream";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-navy"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        )}
      </label>

      {children}

      {hint && !error && <p className="text-xs text-muted">{hint}</p>}

      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-danger"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  className,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(
        controlBase,
        "h-12",
        error ? "border-danger" : "border-line",
        className,
      )}
      aria-invalid={error || undefined}
      {...props}
    />
  );
}

export function Select({
  className,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      className={cn(
        controlBase,
        "h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b6660%22 stroke-width=%222%22 stroke-linecap=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:1.25rem] bg-[position:right_0.875rem_center] bg-no-repeat pr-11",
        error ? "border-danger" : "border-line",
        className,
      )}
      aria-invalid={error || undefined}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={cn(
        controlBase,
        "min-h-28 resize-y py-3 leading-relaxed",
        error ? "border-danger" : "border-line",
        className,
      )}
      aria-invalid={error || undefined}
      {...props}
    />
  );
}
