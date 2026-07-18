import type { RequirementStatus } from "@/lib/matching";
import {
  CheckCircleIcon,
  ClockIcon,
  HelpCircleIcon,
  PencilIcon,
  XCircleIcon,
} from "./icons";

// Ningún estado depende solo del color: siempre incluye icono y texto.
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
  needs_info: {
    label: "Falta un dato tuyo",
    text: "text-status-info",
    bg: "bg-status-info-soft",
    icon: PencilIcon,
  },
  official: {
    label: "Validación oficial",
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
  const config = CONFIG[status];
  const Icon = config.icon;
  const padding = size === "sm" ? "px-2.5 py-1.5 text-[13px]" : "px-3.5 py-2 text-sm";
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ring-1 ring-current/10 ${config.bg} ${config.text} ${padding}`}
    >
      <Icon width={iconSize} height={iconSize} strokeWidth={2.5} />
      {label ?? config.label}
    </span>
  );
}

export function statusLabel(status: RequirementStatus): string {
  return CONFIG[status].label;
}
