"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { AiOpportunityGuide } from "@/components/AiOpportunityGuide";
import { opportunities } from "@/data/opportunities";
import { evaluateOpportunity } from "@/lib/matching";
import { useProfile, useSession } from "@/lib/store";
import {
  AlertIcon,
  ChevronLeftIcon,
  ExternalLinkIcon,
  SlidersIcon,
} from "@/components/icons";

function formatDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function OportunidadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();
  const opportunity = opportunities.find((item) => item.id === params.id);

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/bienvenida");
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, router]);

  if (!opportunity) notFound();
  if (!profileHydrated || !profile.onboarded) return null;

  const evaluation = evaluateOpportunity(opportunity, profile);
  const informational = opportunity.actionability === "informational";
  const hasCloseNumeric = evaluation.evaluations.some(
    (item) =>
      item.status === "close" &&
      item.requirement.type !== "boolean" &&
      item.requirement.type !== "non_verifiable"
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-5 py-7 md:px-10 md:py-9">
        <Link
          href="/oportunidades"
          className="inline-flex items-center gap-1 text-sm font-medium text-canvas-foreground/60 hover:text-canvas-foreground"
        >
          <ChevronLeftIcon width={16} height={16} />
          Volver a las 37 oportunidades
        </Link>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
              {opportunity.category}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-canvas-foreground md:text-3xl">
              {opportunity.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-canvas-foreground/70">
              {opportunity.longDescription}
            </p>
          </div>
          <div className="flex min-w-44 flex-col justify-center rounded-2xl border border-border bg-white p-5">
            {informational ? (
              <>
                <span className="text-lg font-bold text-status-pending">Guía informativa</span>
                <span className="mt-1 text-xs text-canvas-foreground/60">
                  No tiene postulación individual
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl font-bold text-canvas-foreground">
                  {evaluation.measurableCount > 0
                    ? `${evaluation.metCount}/${evaluation.measurableCount}`
                    : "Revisión"}
                </span>
                <span className="mt-1 text-xs text-canvas-foreground/60">
                  {evaluation.measurableCount > 0
                    ? "requisitos medibles cumplidos"
                    : "sin requisitos numéricos"}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!informational && <StatusBadge status={evaluation.dominantStatus} />}
          <span className="text-sm font-medium text-canvas-foreground/60">
            {evaluation.window.label}
          </span>
          {opportunity.cost && (
            <span className="text-sm text-canvas-foreground/60">· {opportunity.cost}</span>
          )}
        </div>

        {!informational && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-canvas-soft px-4 py-3">
            <AlertIcon width={17} height={17} className="mt-0.5 shrink-0 text-status-pending" />
            <p className="text-xs leading-relaxed text-canvas-foreground/65">
              Este resultado compara datos declarados por ti con requisitos documentados.
              “Validación oficial” significa que la universidad o entidad responsable debe
              confirmar ese punto; no equivale a rechazo ni a aprobación.
            </p>
          </div>
        )}

        {hasCloseNumeric && (
          <Link
            href={`/simulador?oportunidad=${opportunity.id}`}
            className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-sidebar px-5 py-4 text-sidebar-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <SlidersIcon width={18} height={18} />
              Estás cerca: simula qué curso puede mejorar tu resultado
            </span>
            <span className="text-sm font-semibold text-primary">Simular →</span>
          </Link>
        )}

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-canvas-foreground/50">
              Requisitos, uno por uno
            </h2>
            <span className="text-xs text-canvas-foreground/45">
              {evaluation.totalCount} requisitos registrados
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {evaluation.evaluations.map((item) => (
              <div key={item.requirement.id} className="rounded-xl border border-border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-canvas-foreground">
                    {item.requirement.description}
                  </p>
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
                <p className="mt-1.5 text-sm leading-relaxed text-canvas-foreground/60">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {!informational && (
          <AiOpportunityGuide
            opportunityId={opportunity.id}
            profile={{
              cycle: profile.cycle,
              cumulativeGpa: profile.cumulativeGpa,
              approvedCredits: profile.approvedCredits,
            }}
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
