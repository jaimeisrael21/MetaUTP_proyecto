import type { RequirementStatus } from "@/lib/matching";
import { CheckCircleIcon, ClockIcon, HelpCircleIcon, XCircleIcon } from "./icons";

// Principio de accesibilidad no negociable (perfil 3 — estudiante con
// discapacidad visual): el estado NUNCA se comunica solo con color. Siempre
// va ícono + color + texto juntos.

const CONFIG: Record<
  RequirementStatus,
  { label: string; text: string; bg: string; icon: typeof CheckCircleIcon }
> = {
  met: {
    label: "Cumples",
    text: "text-status-met",
    bg: "bg-status-met-soft",
    icon: CheckCircleIcon,
  },
  close: {
    label: "Estás cerca",
    text: "text-status-close",
    bg: "bg-status-close-soft",
    icon: ClockIcon,
  },
  pending: {
    label: "Pendiente de verificación",
    text: "text-status-pending",
    bg: "bg-status-pending-soft",
    icon: HelpCircleIcon,
  },
  unmet: {
    label: "No cumples aún",
    text: "text-status-unmet",
    bg: "bg-status-unmet-soft",
    icon: XCircleIcon,
  },
};

export function StatusBadge({
  status,
  label,
  size = "md",
}: {
  status: RequirementStatus;
  label?: string;
  size?: "sm" | "md";
}) {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;
  const padding = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.bg} ${cfg.text} ${padding}`}
    >
      <Icon width={iconSize} height={iconSize} strokeWidth={2.5} />
      {label ?? cfg.label}
    </span>
  );
}

export function statusLabel(status: RequirementStatus): string {
  return CONFIG[status].label;
}
