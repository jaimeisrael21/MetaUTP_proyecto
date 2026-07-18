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
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

export function OpportunityCard({
  opportunity,
  evaluation,
  locked = false,
}: {
  opportunity: Opportunity;
  evaluation?: OpportunityEvaluation;
  locked?: boolean;
}) {
  return (
    <Link
      href={locked ? "/configurar" : `/oportunidades/${opportunity.id}`}
      className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CATEGORY_STYLES[opportunity.category]}`}
        >
          {opportunity.category}
        </span>
        {evaluation && !locked && (
          <span className="text-sm font-bold text-canvas-foreground">
            {evaluation.percent}%
          </span>
        )}
      </div>

      <div>
        <h3 className="text-base font-bold leading-snug text-canvas-foreground">
          {opportunity.title}
        </h3>
        <p className="mt-1 text-sm text-canvas-foreground/70 line-clamp-2">
          {opportunity.shortDescription}
        </p>
      </div>

      {locked ? (
        <div className="mt-1 flex items-center gap-2 rounded-lg bg-canvas-soft px-3 py-2 text-xs font-medium text-canvas-foreground/60">
          <LockIcon width={14} height={14} />
          Configura tu ciclo para ver qué tan cerca estás
        </div>
      ) : (
        <>
          {evaluation && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-soft">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${evaluation.percent}%` }}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {evaluation && <StatusBadge status={evaluation.dominantStatus} size="sm" />}
            {evaluation && (
              <span
                className={`text-xs font-medium ${
                  evaluation.window.status === "active" && (evaluation.window.daysUntilEnd ?? 99) <= 7
                    ? "text-status-close"
                    : "text-canvas-foreground/60"
                }`}
              >
                {evaluation.window.label}
              </span>
            )}
          </div>
        </>
      )}

      {opportunity.windowEnd && locked && (
        <p className="text-xs text-canvas-foreground/50">
          Vence: {formatDate(opportunity.windowEnd)}
        </p>
      )}
    </Link>
  );
}
