import Link from "next/link";
import type { CertificationPath } from "@/data/certifications";
import type { CertificationEvaluation } from "@/lib/certification-matching";
import type { OpportunityMatchState } from "@/lib/matching";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  HelpCircleIcon,
  PencilIcon,
  XCircleIcon,
} from "./icons";
import { RequirementSummary } from "./RequirementSummary";

const MATCH_STATE: Record<
  OpportunityMatchState,
  { label: string; style: string; icon: typeof CheckCircleIcon }
> = {
  recommended: {
    label: "Coincide contigo",
    style: "match-pill--met bg-status-met-soft text-status-met",
    icon: CheckCircleIcon,
  },
  close: {
    label: "Puedes prepararte",
    style: "match-pill--close bg-status-close-soft text-status-close",
    icon: ClockIcon,
  },
  needs_data: {
    label: "Falta un dato",
    style: "match-pill--info bg-status-info-soft text-status-info",
    icon: PencilIcon,
  },
  special_condition: {
    label: "Solo si aplica",
    style: "match-pill--special bg-[#f1e8ff] text-[#6f2ba8]",
    icon: HelpCircleIcon,
  },
  official_validation: {
    label: "Falta por confirmar",
    style: "match-pill--official bg-status-pending-soft text-status-pending",
    icon: HelpCircleIcon,
  },
  not_applicable: {
    label: "Es para otra carrera",
    style: "match-pill--unmet bg-status-unmet-soft text-status-unmet",
    icon: XCircleIcon,
  },
  general_catalog: {
    label: "Catálogo general",
    style: "match-pill--general bg-canvas-soft text-canvas-foreground/62",
    icon: HelpCircleIcon,
  },
};

export function CertificationOpportunityCard({
  path,
  evaluation,
  animationIndex = 0,
}: {
  path: CertificationPath;
  evaluation: CertificationEvaluation;
  animationIndex?: number;
}) {
  const match = MATCH_STATE[evaluation.matchState];
  const MatchIcon = match.icon;
  const requirementRows = evaluation.evaluations.map((item) => ({
    id: item.requirement.id,
    label: item.requirement.description,
    status: item.status,
  }));

  return (
    <Link
      href={`/certificaciones/${path.id}`}
      className="opportunity-card group"
      style={{ animationDelay: `${Math.min(animationIndex, 5) * 45}ms` }}
    >
      <div className="opportunity-card__top">
        <span className="rounded-full bg-[#f1e8ff] px-2.5 py-1 text-xs font-bold text-[#6f2ba8]">
          Certificación
        </span>
        <span className={`match-pill ${match.style}`}>
          <span className="match-pill__icon" aria-hidden="true">
            <MatchIcon width={16} height={16} strokeWidth={2.7} />
          </span>
          {match.label}
        </span>
      </div>

      <div className="opportunity-card__copy">
        <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-canvas-foreground transition-colors group-hover:text-primary">
          {path.title}
        </h3>
        <p className="mt-1.5 line-clamp-1 text-sm leading-5 text-canvas-foreground/65">
          {path.summary}
        </p>
      </div>

      <RequirementSummary
        confirmed={evaluation.confirmedCount}
        total={evaluation.comparisonTotal}
        rows={requirementRows}
      />

      <div className="opportunity-card__footer">
        <span className="line-clamp-1 text-[13px] font-bold text-canvas-foreground/58">
          {path.availabilityLabel}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary">
          Ver detalle <ArrowRightIcon width={16} height={16} />
        </span>
      </div>
    </Link>
  );
}
