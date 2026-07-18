import Link from "next/link";
import type { Opportunity } from "@/data/types";
import type { OpportunityEvaluation, RequirementStatus } from "@/lib/matching";
import { statusLabel, StatusBadge } from "./StatusBadge";
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

const REQUIREMENT_ICON: Record<RequirementStatus, typeof CheckCircleIcon> = {
  met: CheckCircleIcon,
  close: ClockIcon,
  needs_info: PencilIcon,
  official: HelpCircleIcon,
  unmet: XCircleIcon,
};

const REQUIREMENT_STYLE: Record<RequirementStatus, string> = {
  met: "bg-status-met-soft text-status-met",
  close: "bg-status-close-soft text-status-close",
  needs_info: "bg-status-info-soft text-status-info",
  official: "bg-status-pending-soft text-status-pending",
  unmet: "bg-status-unmet-soft text-status-unmet",
};

export function OpportunityCard({
  opportunity,
  evaluation,
  locked = false,
  rank,
  rankingReason,
  animationIndex = 0,
}: {
  opportunity: Opportunity;
  evaluation?: OpportunityEvaluation;
  locked?: boolean;
  rank?: number;
  rankingReason?: string;
  animationIndex?: number;
}) {
  const informational = opportunity.actionability === "informational";
  const visibleRequirements = evaluation?.evaluations.slice(0, 3) ?? [];

  return (
    <Link
      href={locked ? "/configurar" : `/oportunidades/${opportunity.id}`}
      className="opportunity-card group"
      style={{ animationDelay: `${Math.min(animationIndex, 5) * 55}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1.5 text-[13px] font-bold ${CATEGORY_STYLES[opportunity.category]}`}>
            {opportunity.category}
          </span>
          {rank !== undefined && (
            <span className="rounded-full bg-canvas-soft px-3 py-1.5 text-[13px] font-bold text-canvas-foreground/60">
              Para ti · #{rank}
            </span>
          )}
        </div>
        {informational && !locked && (
          <span className="rounded-full bg-status-pending-soft px-2.5 py-1 text-xs font-bold text-status-pending">Referencia</span>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold leading-snug text-canvas-foreground transition-colors group-hover:text-primary">
          {opportunity.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-canvas-foreground/68">
          {opportunity.shortDescription}
        </p>
      </div>

      {locked ? (
        <div className="mt-auto flex items-center gap-2 rounded-xl bg-canvas-soft px-3.5 py-3 text-sm font-semibold text-canvas-foreground/65">
          <LockIcon width={16} height={16} />
          Completa tu perfil para comparar requisitos
        </div>
      ) : (
        <div className="mt-auto space-y-4">
          {evaluation && !informational && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-canvas/70 px-3.5 py-3">
                <StatusBadge status={evaluation.dominantStatus} size="sm" />
                <span className="text-[13px] font-semibold text-canvas-foreground/58">
                  {evaluation.metCount} de {evaluation.totalCount} confirmados con tus datos
                </span>
              </div>

              <div>
                <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-canvas-foreground/48">
                  Requisitos según tu perfil
                </p>
                <ul className="mt-2.5 space-y-2.5">
                  {visibleRequirements.map((item) => {
                    const Icon = REQUIREMENT_ICON[item.status];
                    return (
                      <li key={item.requirement.id} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${REQUIREMENT_STYLE[item.status]}`} title={statusLabel(item.status)}>
                          <Icon width={15} height={15} strokeWidth={2.6} />
                        </span>
                        <span className="min-w-0 flex-1 text-sm leading-5 text-canvas-foreground/72">
                          {item.requirement.description}
                          <span className={`ml-1 font-bold ${REQUIREMENT_STYLE[item.status].split(" ")[1]}`}>
                            · {statusLabel(item.status)}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {evaluation.totalCount > visibleRequirements.length && (
                  <p className="mt-2 text-[13px] font-semibold text-canvas-foreground/48">
                    +{evaluation.totalCount - visibleRequirements.length} requisito{evaluation.totalCount - visibleRequirements.length === 1 ? "" : "s"} en el detalle
                  </p>
                )}
              </div>
            </>
          )}

          {evaluation && informational && (
            <p className="rounded-xl bg-status-pending-soft px-3.5 py-3 text-sm font-semibold text-status-pending">
              Guía informativa sin postulación individual.
            </p>
          )}

          {rankingReason && !informational && (
            <p className="text-[13px] leading-5 text-canvas-foreground/55">{rankingReason}</p>
          )}

          {evaluation && (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3.5">
              <span className={`text-sm font-bold ${evaluation.window.status === "active" && (evaluation.window.daysUntilEnd ?? 99) <= 7 ? "text-status-close" : "text-canvas-foreground/60"}`}>
                {evaluation.window.label}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                Ver detalle <ArrowRightIcon width={16} height={16} />
              </span>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
