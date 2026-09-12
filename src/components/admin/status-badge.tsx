import type { AppointmentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Onay bekliyor",
  CONFIRMED: "Onaylandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal edildi",
  NO_SHOW: "Gelmedi",
};

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING:
    "bg-warning-soft text-warning border-warning/30",
  CONFIRMED:
    "bg-success-soft text-success border-success/30",
  COMPLETED: "bg-brand-soft text-brand border-brand-line",
  CANCELLED:
    "bg-danger-soft text-danger border-danger/30",
  NO_SHOW: "bg-cream text-muted border-line",
};

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-pill border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
