"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { OpportunityCard } from "@/components/OpportunityCard";
import { SlidersIcon } from "@/components/icons";
import { opportunities } from "@/data/opportunities";
import type { OpportunityCategory } from "@/data/types";
import { evaluateOpportunity, rankOpportunity } from "@/lib/matching";
import { useProfile, useSession } from "@/lib/store";

const CATEGORIES: (OpportunityCategory | "Todas")[] = [
  "Todas",
  "Becas",
  "Intercambios",
  "Empleabilidad",
  "Convenios",
];

const WINDOW_FILTERS = ["Todas", "Abiertas", "Próximas", "Cerradas", "Informativas"] as const;
type WindowFilter = (typeof WINDOW_FILTERS)[number];

function matchesWindowFilter(
  filter: WindowFilter,
  status: "active" | "upcoming" | "closed" | "ongoing",
  informational: boolean
) {
  if (filter === "Todas") return true;
  if (filter === "Informativas") return informational;
  if (informational) return false;
  if (filter === "Abiertas") return status === "active" || status === "ongoing";
  if (filter === "Próximas") return status === "upcoming";
  return status === "closed";
}

export default function OportunidadesPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, update, hydrated: profileHydrated } = useProfile();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Todas");
  const [windowFilter, setWindowFilter] = useState<WindowFilter>("Todas");
  const [rankingEnabled, setRankingEnabled] = useState(false);

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/bienvenida");
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, router]);

  const evaluatedAll = useMemo(
    () =>
      opportunities.map((opportunity, catalogIndex) => {
        const evaluation = evaluateOpportunity(opportunity, profile);
        return {
          opportunity,
          evaluation,
          catalogIndex,
          ranking: rankOpportunity(
            opportunity,
            evaluation,
            profile.preferredCategories ?? []
          ),
        };
      }),
    [profile]
  );

  const visibleOpportunities = useMemo(() => {
    const filtered = evaluatedAll
      .filter(
        ({ opportunity }) => category === "Todas" || opportunity.category === category
      )
      .filter(({ opportunity, evaluation }) =>
        matchesWindowFilter(
          windowFilter,
          evaluation.window.status,
          opportunity.actionability === "informational"
        )
      );

    return filtered.sort((first, second) => {
      if (!rankingEnabled) return first.catalogIndex - second.catalogIndex;
      return second.ranking.score - first.ranking.score || first.catalogIndex - second.catalogIndex;
    });
  }, [category, evaluatedAll, rankingEnabled, windowFilter]);

  const summary = useMemo(() => {
    const openActionable = evaluatedAll.filter(
      ({ opportunity, evaluation }) =>
        opportunity.actionability !== "informational" &&
        (evaluation.window.status === "active" || evaluation.window.status === "ongoing")
    );
    return {
      readyNow: openActionable.filter(
        ({ evaluation }) =>
          evaluation.unmetCount === 0 &&
          evaluation.closeCount === 0 &&
          evaluation.needsInfoCount === 0
      ).length,
      closeNow: openActionable.filter(({ evaluation }) => evaluation.closeCount > 0).length,
      openNow: openActionable.length,
      mapped: evaluatedAll.length,
    };
  }, [evaluatedAll]);

  function togglePreferredCategory(selected: OpportunityCategory) {
    const current = profile.preferredCategories ?? [];
    update({
      preferredCategories: current.includes(selected)
        ? current.filter((item) => item !== selected)
        : [...current, selected],
    });
  }

  if (!profileHydrated || !profile.onboarded) return null;

  return (
    <AppShell>
      <div className="px-5 py-7 md:px-10 md:py-9">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Oportunidades</p>
            <h1 className="mt-1 max-w-3xl text-2xl font-bold text-canvas-foreground md:text-3xl">
              Las {summary.mapped} oportunidades siguen aquí. Tú decides cómo ordenarlas.
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-canvas-foreground/65">
              Comparamos tu ciclo {profile.cycle}, promedio {profile.cumulativeGpa} y{" "}
              {profile.approvedCredits} créditos con requisitos documentados. MetaUTP orienta;
              la aceptación y los trámites siempre dependen de la entidad responsable.
            </p>
          </div>
          <button
            type="button"
            aria-pressed={rankingEnabled}
            onClick={() => setRankingEnabled((current) => !current)}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
              rankingEnabled
                ? "bg-sidebar text-sidebar-foreground"
                : "border border-border-strong bg-white text-canvas-foreground hover:bg-canvas-soft"
            }`}
          >
            <SlidersIcon width={17} height={17} />
            {rankingEnabled ? "Volver al orden del catálogo" : "Jerarquizar oportunidades"}
          </button>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen personal">
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-2xl font-bold text-status-met">{summary.readyNow}</p>
            <p className="mt-1 text-xs text-canvas-foreground/60">sin bloqueos detectados hoy</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-2xl font-bold text-status-close">{summary.closeNow}</p>
            <p className="mt-1 text-xs text-canvas-foreground/60">cercanas por un requisito</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-2xl font-bold text-status-info">{summary.openNow}</p>
            <p className="mt-1 text-xs text-canvas-foreground/60">abiertas o permanentes</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-2xl font-bold text-canvas-foreground">{summary.mapped}</p>
            <p className="mt-1 text-xs text-canvas-foreground/60">en el catálogo completo</p>
          </div>
        </section>

        {rankingEnabled && (
          <section className="mt-5 rounded-2xl border border-primary/20 bg-primary-soft p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-bold text-primary">Orden personal activado</h2>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-canvas-foreground/65">
                  Priorizamos compatibilidad, vigencia, cercanía e intereses. No ocultamos
                  ninguna oportunidad ni convertimos el orden en una promesa de admisión.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-semibold text-canvas-foreground/55">
                  Mis intereses:
                </span>
                {CATEGORIES.filter((item): item is OpportunityCategory => item !== "Todas").map(
                  (item) => {
                    const selected = (profile.preferredCategories ?? []).includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => togglePreferredCategory(item)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "border border-primary/20 bg-white text-canvas-foreground/65"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </section>
        )}

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === item
                  ? "bg-sidebar text-sidebar-foreground"
                  : "border border-border bg-white text-canvas-foreground/70 hover:border-border-strong"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por vigencia">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-canvas-foreground/40">
            Vigencia
          </span>
          {WINDOW_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={windowFilter === filter}
              onClick={() => setWindowFilter(filter)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                windowFilter === filter
                  ? "bg-primary-soft text-primary"
                  : "border border-border bg-white text-canvas-foreground/60 hover:border-border-strong"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-canvas-foreground">
            Mostrando {visibleOpportunities.length} de {summary.mapped}
          </p>
          <p className="text-xs text-canvas-foreground/50">
            {rankingEnabled ? "Orden personal: de mayor a menor relevancia" : "Orden del catálogo completo"}
          </p>
        </div>

        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {visibleOpportunities.map(({ opportunity, evaluation, ranking }, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              evaluation={evaluation}
              rank={rankingEnabled ? index + 1 : undefined}
              rankingReason={rankingEnabled ? ranking.reason : undefined}
            />
          ))}
        </div>

        {visibleOpportunities.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-border-strong bg-white p-8 text-center">
            <p className="text-sm font-semibold text-canvas-foreground">
              No hay resultados con esta combinación de filtros.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory("Todas");
                setWindowFilter("Todas");
              }}
              className="mt-3 text-sm font-bold text-primary"
            >
              Ver las {summary.mapped} oportunidades
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
