import Link from "next/link";
import type { Opportunity } from "@/data/types";
import type { OpportunityEvaluation, OpportunityMatchState, RequirementStatus } from "@/lib/matching";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  HelpCircleIcon,
  LockIcon,
  PencilIcon,
  XCircleIcon,
} from "./icons";

const CATEGORY_STYLES: Record<Opportunity["category"], string> = {
  Becas: "bg-primary-soft text-primary",
  Intercambios: "bg-[#e7efff] text-[#2457c5]",
  Empleabilidad: "bg-[#dcfae6] text-[#087a3c]",
  Convenios: "bg-[#f1e8ff] text-[#7a32b8]",
};

const MATCH_STATE: Record<
  OpportunityMatchState,
  { label: string; style: string; icon: typeof CheckCircleIcon }
> = {
  recommended: { label: "Coincide contigo", style: "match-pill--met bg-status-met-soft text-status-met", icon: CheckCircleIcon },
  close: { label: "Estás cerca", style: "match-pill--close bg-status-close-soft text-status-close", icon: ClockIcon },
  needs_data: { label: "Falta un dato", style: "match-pill--info bg-status-info-soft text-status-info", icon: PencilIcon },
  special_condition: { label: "Solo si aplica", style: "match-pill--special bg-[#f1e8ff] text-[#6f2ba8]", icon: HelpCircleIcon },
  official_validation: { label: "Falta por confirmar", style: "match-pill--official bg-status-pending-soft text-status-pending", icon: HelpCircleIcon },
  not_applicable: { label: "No aplica por ahora", style: "match-pill--unmet bg-status-unmet-soft text-status-unmet", icon: XCircleIcon },
  general_catalog: { label: "Catálogo general", style: "match-pill--general bg-canvas-soft text-canvas-foreground/62", icon: HelpCircleIcon },
};

const REQUIREMENT_STATE: Record<RequirementStatus, { label: string; style: string; icon: typeof CheckCircleIcon }> = {
  met: { label: "Cumplido", style: "requirement-row--met", icon: CheckCircleIcon },
  close: { label: "Cercano", style: "requirement-row--close", icon: ClockIcon },
  needs_info: { label: "Completa un dato", style: "requirement-row--info", icon: PencilIcon },
  official: { label: "Confirmación oficial", style: "requirement-row--official", icon: HelpCircleIcon },
  unmet: { label: "Aún no cumplido", style: "requirement-row--unmet", icon: XCircleIcon },
};

function comparableWords(value: string) {
  return new Set(value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 5));
}

function labelsOverlap(first: string, second: string) {
  const firstWords = comparableWords(first);
  const secondWords = comparableWords(second);
  const overlap = [...firstWords].filter((word) => secondWords.has(word)).length;
  return overlap > 0 && overlap / Math.min(firstWords.size, secondWords.size) >= 0.34;
}

export function OpportunityCard({
  opportunity,
  evaluation,
  locked = false,
  rankingReason,
  animationIndex = 0,
}: {
  opportunity: Opportunity;
  evaluation?: OpportunityEvaluation;
  locked?: boolean;
  rankingReason?: string;
  animationIndex?: number;
}) {
  const informational = opportunity.actionability === "informational";
  const match = evaluation ? MATCH_STATE[evaluation.matchState] : null;
  const MatchIcon = match?.icon;
  const confirmed = evaluation?.confirmedCount ?? 0;
  const total = evaluation?.comparisonTotal ?? 0;
  const evaluatedRows = evaluation?.evaluations.map((item) => ({ label: item.requirement.description, status: item.status })) ?? [];
  const requirementRows = evaluation
    ? [
        ...evaluatedRows,
        ...evaluation.gateEvaluations.filter((item) => !evaluatedRows.some((row) => labelsOverlap(row.label, item.gate.label))).map((item) => ({
          label: item.gate.label,
          status: (item.result === "met" ? "met" : item.result === "unmet" ? "unmet" : item.gate.kind === "unprofiled" ? "official" : "needs_info") as RequirementStatus,
        })),
      ]
        .filter((item, index, all) => all.findIndex((candidate) => candidate.label === item.label) === index)
        .sort((first, second) => ({ unmet: 0, close: 1, needs_info: 2, official: 3, met: 4 })[first.status] - ({ unmet: 0, close: 1, needs_info: 2, official: 3, met: 4 })[second.status])
        .slice(0, 4)
    : [];

  return (
    <Link
      href={locked ? "/configurar" : `/oportunidades/${opportunity.id}`}
      className="opportunity-card group"
      style={{ animationDelay: `${Math.min(animationIndex, 5) * 45}ms` }}
      title={rankingReason}
    >
      <div className="opportunity-card__top">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${CATEGORY_STYLES[opportunity.category]}`}>
          {opportunity.category}
        </span>
        {match && MatchIcon && (
          <span className={`match-pill ${match.style}`}>
            <span className="match-pill__icon" aria-hidden="true">
              <MatchIcon width={16} height={16} strokeWidth={2.7} />
            </span>
            {match.label}
          </span>
        )}
      </div>

      <div className="opportunity-card__copy">
        <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-canvas-foreground transition-colors group-hover:text-primary">
          {opportunity.title}
        </h3>
        <p className="mt-1.5 line-clamp-1 text-sm leading-5 text-canvas-foreground/65">
          {opportunity.shortDescription}
        </p>
      </div>

      {locked ? (
        <div className="mt-auto flex items-center gap-2 rounded-xl bg-canvas-soft px-3.5 py-3 text-sm font-semibold text-canvas-foreground/65">
          <LockIcon width={17} height={17} />
          Completa tu perfil para comparar requisitos
        </div>
      ) : evaluation ? (
        <div className="opportunity-card__evaluation">
          {!informational ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-semibold text-canvas-foreground/58">Requisitos confirmados</span>
                <strong className="text-sm text-canvas-foreground">{confirmed} de {total}</strong>
              </div>
              <div className="requirement-progress" aria-label={`${confirmed} de ${total} requisitos confirmados`}>
                <span style={{ width: `${total > 0 ? Math.round((confirmed / total) * 100) : 0}%` }} />
              </div>
              <ul className="requirement-list" aria-label="Estado de requisitos principales">
                {requirementRows.map((item) => {
                  const visual = REQUIREMENT_STATE[item.status];
                  const Icon = visual.icon;
                  return <li key={`${item.status}-${item.label}`} className={`requirement-row ${visual.style}`} title={`${visual.label}: ${item.label}`}><span className="requirement-row__icon" aria-hidden="true"><Icon width={16} height={16} strokeWidth={2.7} /></span><span className="line-clamp-1">{item.label}</span></li>;
                })}
              </ul>
            </>
          ) : (
            <p className="rounded-xl bg-canvas-soft px-3.5 py-3 text-sm font-semibold text-canvas-foreground/62">
              Referencia útil sin postulación individual.
            </p>
          )}
        </div>
      ) : null}

      {evaluation && (
        <div className="opportunity-card__footer">
          <span className={`line-clamp-1 text-[13px] font-bold ${evaluation.window.status === "active" && (evaluation.window.daysUntilEnd ?? 99) <= 7 ? "text-status-close" : "text-canvas-foreground/58"}`}>
            {evaluation.window.label}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary">
            Ver detalle <ArrowRightIcon width={16} height={16} />
          </span>
        </div>
      )}
    </Link>
  );
}
