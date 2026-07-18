import Link from "next/link";
import type { Opportunity } from "@/data/types";
import type { OpportunityEvaluation } from "@/lib/matching";
import { StatusBadge } from "./StatusBadge";
import { LockIcon } from "./icons";

const CATEGORY_STYLES: Record<Opportunity["category"], string> = {
  Becas: "bg-primary-soft text-primary",
  Intercambios: "bg-[#e6eefc] text-[#1d4ed8]",
  Empleabilidad: "bg-[#e5f5ec] text-[#15803d]",
  Convenios: "bg-[#f3ecfb] text-[#7e22ce]",
};

function formatDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OpportunityCard({
  opportunity,
  evaluation,
  locked = false,
  rank,
  rankingReason,
}: {
  opportunity: Opportunity;
  evaluation?: OpportunityEvaluation;
  locked?: boolean;
  rank?: number;
  rankingReason?: string;
}) {
  const informational = opportunity.actionability === "informational";

  return (
    <Link
      href={locked ? "/configurar" : `/oportunidades/${opportunity.id}`}
      className="group relative flex min-h-full flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {rank !== undefined && (
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-sidebar px-2 text-xs font-bold text-sidebar-foreground">
              #{rank}
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CATEGORY_STYLES[opportunity.category]}`}
          >
            {opportunity.category}
          </span>
        </div>
        {informational && !locked && (
          <span className="rounded-full bg-status-pending-soft px-2.5 py-1 text-xs font-semibold text-status-pending">
            Referencia
          </span>
        )}
      </div>

      <div>
        <h3 className="text-base font-bold leading-snug text-canvas-foreground group-hover:text-primary">
          {opportunity.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-canvas-foreground/70">
          {opportunity.shortDescription}
        </p>
      </div>

      {rankingReason && (
        <p className="rounded-lg bg-canvas-soft px-3 py-2 text-xs font-medium leading-relaxed text-canvas-foreground/70">
          <span className="font-bold text-canvas-foreground">Por qué está aquí:</span>{" "}
          {rankingReason}
        </p>
      )}

      {locked ? (
        <div className="mt-auto flex items-center gap-2 rounded-lg bg-canvas-soft px-3 py-2 text-xs font-medium text-canvas-foreground/60">
          <LockIcon width={14} height={14} />
          Configura tu ciclo para comparar tus requisitos
        </div>
      ) : (
        <div className="mt-auto space-y-3 pt-1">
          {evaluation && !informational && (
            <>
              <StatusBadge status={evaluation.dominantStatus} size="sm" />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-canvas-foreground/55">
                {evaluation.measurableCount > 0 && (
                  <span>
                    <strong className="text-canvas-foreground">{evaluation.metCount}</strong> de{" "}
                    {evaluation.measurableCount} requisitos medibles cumplidos
                  </span>
                )}
                {evaluation.officialCount > 0 && (
                  <span>{evaluation.officialCount} de validación oficial</span>
                )}
                {evaluation.needsInfoCount > 0 && (
                  <span>{evaluation.needsInfoCount} por completar</span>
                )}
              </div>
            </>
          )}
          {evaluation && informational && (
            <p className="text-xs font-medium text-status-pending">
              Sin postulación individual; úsala como guía
            </p>
          )}
          {evaluation && (
            <p
              className={`border-t border-border pt-3 text-xs font-semibold ${
                evaluation.window.status === "active" &&
                (evaluation.window.daysUntilEnd ?? 99) <= 7
                  ? "text-status-close"
                  : "text-canvas-foreground/60"
              }`}
            >
              {evaluation.window.label}
            </p>
          )}
        </div>
      )}

      {opportunity.windowEnd && locked && (
        <p className="text-xs text-canvas-foreground/50">
          Vence: {formatDate(opportunity.windowEnd)}
        </p>
      )}
    </Link>
  );
}
