import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Referanstaki `btn-one` davranışı: hover'da ikinci bir renk katmanı
 * sağdan sola kayarak butonu dolduruyor. Katman ::after ile çiziliyor,
 * içerik `relative z-10` ile üstte kalıyor.
 */
const buttonVariants = cva(
  [
    "group/btn relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill",
    "font-head font-semibold whitespace-nowrap border-2 border-transparent",
    "transition-[color,border-color] duration-300",
    "after:absolute after:inset-0 after:-z-10 after:origin-right after:scale-x-0",
    "after:transition-transform after:duration-500 after:ease-[cubic-bezier(.4,0,.2,1)]",
    "hover:after:origin-left hover:after:scale-x-100",
    "disabled:pointer-events-none disabled:opacity-55",
    "[&_svg]:relative [&_svg]:z-10 [&_svg]:size-[1.15em] [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-white shadow-[0_8px_22px_rgb(255_72_128/0.32)] hover:border-navy after:bg-navy",
        leaf: "bg-leaf text-white shadow-[0_8px_22px_rgb(143_196_36/0.3)] hover:border-navy after:bg-navy",
        navy: "bg-navy text-white hover:border-white hover:text-navy after:bg-white",
        danger:
          "bg-brand-dark text-white shadow-[0_8px_22px_rgb(227_53_107/0.28)] hover:border-navy-deep after:bg-navy-deep",
        white: "bg-white text-navy hover:border-white hover:text-white after:bg-navy",
        outline:
          "border-navy/20 bg-white/60 text-navy hover:border-brand hover:text-white after:bg-brand",
        ghost:
          "text-navy after:hidden hover:bg-cream hover:text-brand",
        link: "text-brand after:hidden underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-10 px-5 text-sm",
        md: "h-12 px-7 text-[0.9375rem]",
        lg: "h-14 px-9 text-[0.9375rem]",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

/**
 * Buton içeriği ::after dolgu katmanının üstünde kalmalı.
 *
 * inline-flex şart: Tailwind preflight svg'yi `display: block` yaptığı için
 * düz bir <span> içinde ikon satırı kırıp metnin üstüne geçiyor.
 */
function Content({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative z-10 inline-flex items-center justify-center gap-2">
      {children}
    </span>
  );
}

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  className?: string;
};

export type ButtonProps = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  className,
  variant,
  size,
  block,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    >
      <Content>{children}</Content>
    </button>
  );
}

export type ButtonLinkProps = ButtonBaseProps &
  React.ComponentProps<typeof Link>;

export function ButtonLink({
  className,
  variant,
  size,
  block,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    >
      <Content>{children}</Content>
    </Link>
  );
}

/** <a> etiketi gerektiren durumlar için (tel:, mailto:, dış bağlantı). */
export type ButtonAnchorProps = ButtonBaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function ButtonAnchor({
  className,
  variant,
  size,
  block,
  children,
  ...props
}: ButtonAnchorProps) {
  return (
    <a
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    >
      <Content>{children}</Content>
    </a>
  );
}

export { buttonVariants };
