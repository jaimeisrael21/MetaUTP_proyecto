"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { AiOpportunityGuide } from "@/components/AiOpportunityGuide";
import { opportunities } from "@/data/opportunities";
import {
  evaluateOpportunity,
  isPersonalizedOpportunityVisible,
  isRelevantClosedOpportunity,
} from "@/lib/matching";
import type { OpportunityMatchState } from "@/lib/matching";
import { useProfile, useSession } from "@/lib/store";
import {
  ChevronLeftIcon,
  ExternalLinkIcon,
} from "@/components/icons";

function formatDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const MATCH_LABEL: Record<OpportunityMatchState, { label: string; style: string }> = {
  recommended: { label: "Coincide contigo", style: "bg-status-met-soft text-status-met" },
  close: { label: "Estás cerca", style: "bg-status-close-soft text-status-close" },
  needs_data: { label: "Falta un dato esencial", style: "bg-status-info-soft text-status-info" },
  special_condition: { label: "Solo si esta condición aplica", style: "bg-[#f1e8ff] text-[#6f2ba8]" },
  official_validation: { label: "Requiere validación oficial", style: "bg-status-pending-soft text-status-pending" },
  not_applicable: { label: "No aplica por ahora", style: "bg-status-unmet-soft text-status-unmet" },
  general_catalog: { label: "Catálogo general", style: "bg-canvas-soft text-canvas-foreground/62" },
};

function isAcademicPerformanceRequirement(description: string, type: string) {
  const normalized = description
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return (
    type === "numeric_gpa" ||
    normalized.includes("promedio") ||
    normalized.includes("nota") ||
    normalized.includes("merito academico") ||
    normalized.includes("orden de merito")
  );
}

function normalizedCost(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function OportunidadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const opportunity = opportunities.find((item) => item.id === params.id);

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/configurar");
    else if (!profile.academicSetupComplete) router.replace("/panel?setup=1");
    else if (!profile.profileRefined) router.replace("/personalizar");
    else if (opportunity) {
      const evaluation = evaluateOpportunity(opportunity, profile);
      const canOpenAsReference = isRelevantClosedOpportunity(evaluation);
      if (!canOpenAsReference && !isPersonalizedOpportunityVisible(evaluation, opportunity)) {
        router.replace("/oportunidades");
      }
    }
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile, opportunity, router]);

  if (!opportunity) notFound();
  if (!profileHydrated || !profile.onboarded || !profile.academicSetupComplete || !profile.profileRefined) return null;

  const evaluation = evaluateOpportunity(opportunity, profile);
  const canOpenAsReference = isRelevantClosedOpportunity(evaluation);
  if (!canOpenAsReference && !isPersonalizedOpportunityVisible(evaluation, opportunity)) return null;
  const informational = opportunity.actionability === "informational";
  const match = MATCH_LABEL[evaluation.matchState];
  const totalSignals = evaluation.comparisonTotal;
  const confirmedSignals = evaluation.confirmedCount;
  const orderedRequirements = [...evaluation.evaluations].sort((first, second) => {
    const firstAcademic = isAcademicPerformanceRequirement(
      first.requirement.description,
      first.requirement.type
    );
    const secondAcademic = isAcademicPerformanceRequirement(
      second.requirement.description,
      second.requirement.type
    );
    return Number(secondAcademic) - Number(firstAcademic);
  });
  const costIsConfirmed = Boolean(
    opportunity.cost &&
      !normalizedCost(opportunity.cost).includes("no se publica") &&
      !normalizedCost(opportunity.cost).includes("por confirmar")
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-5 py-7 md:px-10 md:py-10">
        <Link
          href="/oportunidades"
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-canvas-foreground/60 transition hover:text-primary"
        >
          <ChevronLeftIcon width={16} height={16} />
          Volver a oportunidades
        </Link>

        <div className="mt-6 grid gap-6 rounded-3xl border border-border bg-white p-6 shadow-[0_18px_55px_rgba(39,29,18,0.07)] lg:grid-cols-[1fr_auto] md:p-8">
          <div>
            <span className="rounded-full bg-primary-soft px-3 py-1.5 text-[13px] font-bold text-primary">
              {opportunity.category}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-canvas-foreground md:text-4xl">
              {opportunity.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-canvas-foreground/70">
              {opportunity.longDescription}
            </p>
          </div>
          <div className="detail-score-card">
            {informational ? (
              <>
                <span className="text-lg font-bold text-status-pending">Guía informativa</span>
                <span className="mt-1 text-sm text-canvas-foreground/60">
                  No tiene postulación individual
                </span>
              </>
            ) : (
              <>
                <span className="text-4xl font-extrabold text-canvas-foreground">
                  {confirmedSignals}/{totalSignals}
                </span>
                <span className="mt-1 text-sm leading-5 text-canvas-foreground/60">
                  requisitos confirmados con tus datos
                </span>
              </>
            )}
          </div>
        </div>

        <div className="detail-meta-row">
          {!informational && (
            <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${match.style}`}>
              {match.label}
            </span>
          )}
          <span
            className={`detail-meta-pill ${evaluation.window.status === "active" ? "detail-meta-pill--date-active" : ""}`}
          >
            {evaluation.window.label}
          </span>
          {opportunity.cost && (
            <span className={costIsConfirmed ? "detail-cost-pill" : "detail-meta-pill"}>
              {opportunity.cost}
            </span>
          )}
        </div>

        {!informational && evaluation.gateEvaluations.length > 0 && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                aria-expanded={conditionsOpen}
                aria-controls="essential-profile-conditions"
                onClick={() => setConditionsOpen((current) => !current)}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas-soft text-primary">
                  <ChevronLeftIcon
                    width={18}
                    height={18}
                    className={`transition-transform ${conditionsOpen ? "-rotate-90" : "rotate-180"}`}
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-bold text-canvas-foreground">
                    Condiciones esenciales de tu perfil
                  </span>
                  <span className="mt-0.5 block text-sm text-canvas-foreground/55">
                    {conditionsOpen
                      ? "Ocultar condiciones"
                      : `${evaluation.gateEvaluations.length} condiciones · mostrar detalle`}
                  </span>
                </span>
              </button>
              <Link
                href="/configuracion"
                className="shrink-0 text-sm font-bold text-primary hover:underline"
              >
                Editar datos
              </Link>
            </div>
            {conditionsOpen && (
              <div
                id="essential-profile-conditions"
                className="grid gap-3 border-t border-border bg-canvas/45 p-4 md:grid-cols-2"
              >
                {evaluation.gateEvaluations.map(({ gate, result }) => (
                  <div
                    key={gate.id}
                    className="rounded-2xl border border-border bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold leading-6 text-canvas-foreground">
                        {gate.label}
                      </p>
                      <StatusBadge
                        status={
                          result === "met" ? "met" : result === "unmet" ? "unmet" : "needs_info"
                        }
                        label={
                          result === "met"
                            ? "Confirmado"
                            : result === "unmet"
                              ? "No coincide"
                              : "Falta dato"
                        }
                        size="sm"
                      />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-canvas-foreground/62">
                      {result === "met"
                        ? "Tu respuesta coincide con esta condición. La entidad aún puede solicitar sustento."
                        : result === "unmet"
                          ? "Con lo que declaraste, esta oportunidad no corresponde por ahora."
                          : "No asumimos que cumples esta condición: complétala solo si deseas considerarla."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-bold text-canvas-foreground">
              Requisitos, uno por uno
            </h2>
            <span className="text-sm font-medium text-canvas-foreground/50">
              {evaluation.totalCount} requisitos documentados
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {orderedRequirements.map((item) => {
              const academicRequirement = isAcademicPerformanceRequirement(
                item.requirement.description,
                item.requirement.type
              );
              return (
                <div
                  key={item.requirement.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${academicRequirement ? "academic-requirement-card" : "border-border hover:border-border-strong"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      {academicRequirement && (
                        <span className="academic-requirement-label">Rendimiento académico</span>
                      )}
                      <p
                        className={`${academicRequirement ? "mt-2" : ""} text-base font-bold text-canvas-foreground`}
                      >
                        {item.requirement.description}
                      </p>
                    </div>
                    <StatusBadge
                      status={item.status}
                      label={
                        item.status === "official"
                          ? "Confirmación oficial"
                          : item.status === "needs_info"
                            ? "Completa este dato"
                            : undefined
                      }
                      size="sm"
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-canvas-foreground/65">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {!informational && (
          <AiOpportunityGuide
            opportunityId={opportunity.id}
            windowLabel={evaluation.window.label}
            signals={evaluation.evaluations.map((item) => ({ requirement: item.requirement.description, status: item.status, detail: item.detail }))}
          />
        )}

        <section className="mt-8 rounded-2xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-canvas-foreground/50">
            Fuente y vigencia del dato
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-canvas-foreground">
                {opportunity.source.label}
              </p>
              {opportunity.source.sourceNote && (
                <p className="mt-0.5 text-xs text-canvas-foreground/50">
                  {opportunity.source.sourceNote}
                </p>
              )}
              <p className="mt-1 text-xs text-canvas-foreground/40">
                Dato revisado: {formatDate(opportunity.lastUpdated)}
              </p>
            </div>
            {opportunity.source.url && (
              <a
                href={opportunity.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-canvas-foreground hover:bg-canvas-soft"
              >
                Abrir fuente oficial
                <ExternalLinkIcon width={14} height={14} />
              </a>
            )}
          </div>
        </section>

        {opportunity.actionNote && (
          <section className="mt-6 rounded-2xl bg-primary-soft p-5">
            <h2 className="text-sm font-bold text-primary">Tu siguiente acción</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-canvas-foreground/80">
              {opportunity.actionNote}
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
