"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Stethoscope,
  Tag,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { logout } from "@/app/admin/(panel)/logout-action";

const navGroups = [
  {
    label: "Genel",
    items: [
      { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
      { href: "/admin/randevular", label: "Randevular", icon: ClipboardList },
      { href: "/admin/takvim", label: "Çalışma Takvimi", icon: CalendarDays },
    ],
  },
  {
    label: "İçerik",
    items: [
      { href: "/admin/hizmetler", label: "Hizmetler", icon: Stethoscope },
      { href: "/admin/fiyatlar", label: "Fiyat Listesi", icon: Tag },
      { href: "/admin/ekip", label: "Ekip", icon: Users },
      { href: "/admin/sss", label: "S.S.S.", icon: HelpCircle },
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/sayfalar", label: "Sayfalar", icon: FileText },
    ],
  },
  {
    label: "Ayarlar",
    items: [
      { href: "/admin/saatler", label: "Çalışma Saatleri", icon: Clock },
      { href: "/admin/ayarlar", label: "Site Ayarları", icon: Settings },
    ],
  },
];

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-dvh bg-cream">
      {/* Mobil başlık */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Link href="/admin" className="font-head font-bold text-navy">
          Yönetim Paneli
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-lg text-navy hover:bg-cream"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      <div className="flex">
        {/* Kenar çubuğu */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 shrink-0 overflow-y-auto border-r border-line bg-white transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-[4.75rem] items-center gap-3 border-b border-line px-5">
            <Image
              src="/img/logo.webp"
              alt="Kıymet Veteriner Kliniği"
              width={600}
              height={201}
              className="h-10 w-auto"
              priority
            />
            <span className="rounded-pill bg-cream px-2.5 py-1 text-[0.625rem] font-semibold tracking-wider text-muted uppercase">
              Panel
            </span>
          </div>

          <nav className="grid gap-6 p-4" aria-label="Panel menüsü">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 px-3 text-[0.6875rem] font-semibold tracking-wider text-muted uppercase">
                  {group.label}
                </p>
                <ul className="grid gap-0.5">
                  {group.items.map(({ href, label, icon: Icon, exact }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.9375rem] font-medium transition-colors",
                          isActive(href, exact)
                            ? "bg-brand-soft text-brand-dark"
                            : "text-navy hover:bg-cream",
                        )}
                      >
                        <Icon className="size-4.5 shrink-0" aria-hidden />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-auto border-t border-line p-4">
            <Link
              href="/"
              target="_blank"
              className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-cream"
            >
              <ExternalLink className="size-4" aria-hidden />
              Siteyi görüntüle
            </Link>

            <div className="rounded-xl bg-cream p-3">
              <p className="truncate text-sm font-semibold text-navy">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted">{user.email}</p>

              <form action={logout} className="mt-3">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-navy transition-colors hover:text-danger"
                >
                  <LogOut className="size-4" aria-hidden />
                  Çıkış Yap
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Mobilde kenar çubuğu açıkken arka planı karart */}
        {open && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-navy-deep/40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Menüyü kapat"
          />
        )}

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl p-5 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Panel sayfalarında ortak başlık. */
export function PageHeader({
  title,
  description,
  backHref,
  action,
}: {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Geri
          </Link>
        )}
        <h1 className="font-head text-2xl font-bold text-navy">{title}</h1>
        {description && (
          <p className="mt-1 text-[0.9375rem] text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
