"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { opportunities } from "@/data/opportunities";
import { evaluateOpportunity } from "@/lib/matching";
import { useProfile, useSession } from "@/lib/store";
import { ChevronLeftIcon, ExternalLinkIcon, SlidersIcon } from "@/components/icons";

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
}

export default function OportunidadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();

  const opportunity = opportunities.find((o) => o.id === params.id);

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/bienvenida");
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, router]);

  if (!opportunity) {
    notFound();
  }

  if (!profileHydrated || !profile.onboarded) return null;

  const evaluation = evaluateOpportunity(opportunity, profile);
  const hasCloseNumeric = evaluation.evaluations.some(
    (e) => e.status === "close" && e.requirement.type !== "boolean" && e.requirement.type !== "non_verifiable"
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-8 md:px-10">
        <Link
          href="/oportunidades"
          className="inline-flex items-center gap-1 text-sm font-medium text-canvas-foreground/60 hover:text-canvas-foreground"
        >
          <ChevronLeftIcon width={16} height={16} />
          Todas las oportunidades
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
              {opportunity.category}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-canvas-foreground md:text-3xl">
              {opportunity.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-canvas-foreground/70">
              {opportunity.longDescription}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center rounded-2xl border border-border bg-white px-6 py-4 text-center">
            <span className="text-3xl font-bold text-primary">{evaluation.percent}%</span>
            <span className="text-xs text-canvas-foreground/60">de cercanía</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <StatusBadge status={evaluation.dominantStatus} />
          <span className="text-sm text-canvas-foreground/60">{evaluation.window.label}</span>
          {opportunity.cost && (
            <span className="text-sm text-canvas-foreground/60">· {opportunity.cost}</span>
          )}
        </div>

        {hasCloseNumeric && (
          <Link
            href={`/simulador?oportunidad=${opportunity.id}`}
            className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-sidebar px-5 py-4 text-sidebar-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <SlidersIcon width={18} height={18} />
              Estás cerca — simula qué curso te acerca a este requisito
            </span>
            <span className="text-sm font-semibold text-primary">Simular →</span>
          </Link>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-canvas-foreground/50">
            Requisitos
          </h2>
          <div className="mt-3 space-y-3">
            {evaluation.evaluations.map((ev) => (
              <div
                key={ev.requirement.id}
                className="rounded-xl border border-border bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-canvas-foreground">
                    {ev.requirement.description}
                  </p>
                  <StatusBadge status={ev.status} size="sm" />
                </div>
                <p className="mt-1.5 text-sm text-canvas-foreground/60">{ev.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-canvas-foreground/50">
            Fuentes y verificación
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
                Actualizado: {formatDate(opportunity.lastUpdated)}
              </p>
            </div>
            {opportunity.source.url && (
              <a
                href={opportunity.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-canvas-foreground hover:bg-canvas-soft"
              >
                Ver documento oficial
                <ExternalLinkIcon width={14} height={14} />
              </a>
            )}
          </div>
        </section>

        {opportunity.actionNote && (
          <section className="mt-6 rounded-2xl bg-primary-soft p-5">
            <h2 className="text-sm font-bold text-primary">Siguiente acción</h2>
            <p className="mt-1.5 text-sm text-canvas-foreground/80">{opportunity.actionNote}</p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
