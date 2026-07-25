import type { RequirementStatus } from "@/lib/matching";
import {
  CheckCircleIcon,
  ClockIcon,
  HelpCircleIcon,
  PencilIcon,
  XCircleIcon,
} from "./icons";

export interface RequirementSummaryRow {
  id: string;
  label: string;
  status: RequirementStatus;
}

const REQUIREMENT_STATE: Record<
  RequirementStatus,
  { label: string; style: string; icon: typeof CheckCircleIcon }
> = {
  met: { label: "Cumplido", style: "requirement-row--met", icon: CheckCircleIcon },
  close: { label: "Cercano", style: "requirement-row--close", icon: ClockIcon },
  needs_info: {
    label: "Completa un dato",
    style: "requirement-row--info",
    icon: PencilIcon,
  },
  official: {
    label: "Confirmación oficial",
    style: "requirement-row--official",
    icon: HelpCircleIcon,
  },
  unmet: { label: "Aún no cumplido", style: "requirement-row--unmet", icon: XCircleIcon },
};

const STATUS_ORDER: Record<RequirementStatus, number> = {
  unmet: 0,
  close: 1,
  needs_info: 2,
  official: 3,
  met: 4,
};

export function RequirementSummary({
  confirmed,
  total,
  rows,
}: {
  confirmed: number;
  total: number;
  rows: RequirementSummaryRow[];
}) {
  const visibleRows = [...rows]
    .sort((first, second) => STATUS_ORDER[first.status] - STATUS_ORDER[second.status])
    .slice(0, 4);

  return (
    <div className="opportunity-card__evaluation">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-canvas-foreground/58">
          Requisitos confirmados
        </span>
        <strong className="text-sm text-canvas-foreground">
          {confirmed} de {total}
        </strong>
      </div>
      <div
        className="requirement-progress"
        aria-label={`${confirmed} de ${total} requisitos confirmados`}
      >
        <span
          style={{ width: `${total > 0 ? Math.round((confirmed / total) * 100) : 0}%` }}
        />
      </div>
      <ul className="requirement-list" aria-label="Estado de requisitos principales">
        {visibleRows.map((item) => {
          const visual = REQUIREMENT_STATE[item.status];
          const Icon = visual.icon;
          return (
            <li
              key={item.id}
              className={`requirement-row ${visual.style}`}
              title={`${visual.label}: ${item.label}`}
            >
              <span className="requirement-row__icon" aria-hidden="true">
                <Icon width={16} height={16} strokeWidth={2.7} />
              </span>
              <span className="line-clamp-1">{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
