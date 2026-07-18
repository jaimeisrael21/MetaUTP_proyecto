import Link from "next/link";
import type { Opportunity } from "@/data/types";
import type { OpportunityEvaluation, OpportunityMatchState } from "@/lib/matching";
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
  recommended: { label: "Coincide contigo", style: "bg-status-met-soft text-status-met", icon: CheckCircleIcon },
  close: { label: "Estás cerca", style: "bg-status-close-soft text-status-close", icon: ClockIcon },
  needs_data: { label: "Falta un dato", style: "bg-status-info-soft text-status-info", icon: PencilIcon },
  special_condition: { label: "Solo si aplica", style: "bg-[#f1e8ff] text-[#6f2ba8]", icon: HelpCircleIcon },
  official_validation: { label: "Validación oficial", style: "bg-status-pending-soft text-status-pending", icon: HelpCircleIcon },
  not_applicable: { label: "No aplica por ahora", style: "bg-status-unmet-soft text-status-unmet", icon: XCircleIcon },
  general_catalog: { label: "Catálogo general", style: "bg-canvas-soft text-canvas-foreground/62", icon: HelpCircleIcon },
};

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
            <MatchIcon width={17} height={17} strokeWidth={2.5} />
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
              <div className="min-h-6">
                {evaluation.primaryGap ? (
                  <p className="line-clamp-1 text-[13px] leading-5 text-canvas-foreground/65">
                    <strong className="text-canvas-foreground/78">Punto clave:</strong> {evaluation.primaryGap}
                  </p>
                ) : (
                  <p className="line-clamp-1 text-[13px] font-semibold text-status-met">No detectamos bloqueos con tus datos.</p>
                )}
              </div>
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
