"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ChevronLeftIcon, CompassIcon, SparklesIcon } from "@/components/icons";
import { OpportunityCard } from "@/components/OpportunityCard";
import { SetupProgress } from "@/components/SetupProgress";
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
const PAGE_SIZE = 6;

export default function OportunidadesPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Todas");
  const [page, setPage] = useState(1);
  const resultsStart = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/configurar");
    else if (!profile.academicSetupComplete) router.replace("/panel?setup=1");
  }, [
    sessionHydrated,
    profileHydrated,
    session.loggedIn,
    profile.onboarded,
    profile.academicSetupComplete,
    router,
  ]);

  const evaluatedAll = useMemo(
    () =>
      opportunities.map((opportunity, catalogIndex) => {
        const evaluation = evaluateOpportunity(opportunity, profile);
        return {
          opportunity,
          evaluation,
          catalogIndex,
          ranking: rankOpportunity(opportunity, evaluation, profile.preferredCategories ?? []),
        };
      }),
    [profile]
  );

  const orderedOpportunities = useMemo(() => {
    return evaluatedAll
      .filter(({ opportunity }) => category === "Todas" || opportunity.category === category)
      .sort(
        (first, second) =>
          second.ranking.score - first.ranking.score || first.catalogIndex - second.catalogIndex
      );
  }, [category, evaluatedAll]);

  const totalPages = Math.max(1, Math.ceil(orderedOpportunities.length / PAGE_SIZE));
  const pageItems = orderedOpportunities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => {
    const currentlyRelevant = evaluatedAll.filter(
      ({ opportunity, evaluation }) =>
        opportunity.actionability !== "informational" && evaluation.window.status !== "closed"
    );
    return {
      ready: currentlyRelevant.filter(({ evaluation }) => evaluation.dominantStatus === "met").length,
      close: currentlyRelevant.filter(({ evaluation }) => evaluation.dominantStatus === "close").length,
      needsInfo: currentlyRelevant.filter(({ evaluation }) => evaluation.dominantStatus === "needs_info").length,
      official: currentlyRelevant.filter(({ evaluation }) => evaluation.dominantStatus === "official").length,
    };
  }, [evaluatedAll]);

  function chooseCategory(next: (typeof CATEGORIES)[number]) {
    setCategory(next);
    setPage(1);
  }

  function goToPage(next: number) {
    setPage(next);
    window.requestAnimationFrame(() => {
      resultsStart.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (!profileHydrated || !profile.onboarded || !profile.academicSetupComplete) return null;

  const rangeStart = orderedOpportunities.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, orderedOpportunities.length);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] px-5 py-7 md:px-9 md:py-9 xl:px-12">
        <div className="max-w-2xl">
          <SetupProgress current={3} />
        </div>

        <header className="mt-7 page-enter">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="eyebrow">Seleccionadas con tus datos</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-canvas-foreground md:text-5xl">
                Oportunidades
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-canvas-foreground/70">
                {profile.name ? `${profile.name.split(" ")[0]}, o` : "O"}rdenamos el catálogo según tu ciclo {profile.cycle},
                promedio {profile.cumulativeGpa} y {profile.approvedCredits} créditos. Ninguna
                oportunidad se oculta: usa los filtros y las páginas para explorarlas todas.
              </p>
            </div>
            <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-primary/20 bg-primary-soft px-4 py-2.5 text-sm font-bold text-primary xl:self-auto">
              <SparklesIcon width={17} height={17} />
              Orden personal activo
            </div>
          </div>
        </header>

        <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumen personal">
          <div className="metric-card metric-card--met">
            <span className="metric-card__value">{summary.ready}</span>
            <span className="metric-card__label">Listas para explorar</span>
            <span className="metric-card__help">Sin bloqueos detectados</span>
          </div>
          <div className="metric-card metric-card--close">
            <span className="metric-card__value">{summary.close}</span>
            <span className="metric-card__label">Estás muy cerca</span>
            <span className="metric-card__help">A un requisito medible</span>
          </div>
          <div className="metric-card metric-card--info">
            <span className="metric-card__value">{summary.needsInfo}</span>
            <span className="metric-card__label">Completa un dato</span>
            <span className="metric-card__help">Puedes mejorarlas hoy</span>
          </div>
          <div className="metric-card metric-card--official">
            <span className="metric-card__value">{summary.official}</span>
            <span className="metric-card__label">Validación oficial</span>
            <span className="metric-card__help">Dependen de la entidad</span>
          </div>
        </section>

        <section className="mt-7" aria-labelledby="catalog-title">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:p-5">
            <div>
              <h2 id="catalog-title" className="text-lg font-bold text-canvas-foreground">Explora por categoría</h2>
              <p className="mt-1 text-sm text-canvas-foreground/60">Dentro de cada categoría mantenemos primero lo más relevante para ti.</p>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => chooseCategory(item)}
                  className={`filter-pill ${category === item ? "filter-pill--active" : ""}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div ref={resultsStart} className="scroll-mt-5 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-base font-bold text-canvas-foreground">
                {category === "Todas" ? "Recomendadas para ti" : category}
              </p>
              <p className="text-sm font-semibold text-canvas-foreground/55">
                Mostrando {rangeStart}–{rangeEnd} de {orderedOpportunities.length}
              </p>
            </div>

            <div className="mt-4 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {pageItems.map(({ opportunity, evaluation, ranking }, index) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  evaluation={evaluation}
                  rank={(page - 1) * PAGE_SIZE + index + 1}
                  rankingReason={ranking.reason}
                  animationIndex={index}
                />
              ))}
            </div>

            {pageItems.length === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-border-strong bg-white p-8 text-center">
                <CompassIcon className="mx-auto text-primary" width={28} height={28} />
                <p className="mt-3 text-base font-bold text-canvas-foreground">No hay resultados en esta categoría.</p>
                <button type="button" onClick={() => chooseCategory("Todas")} className="secondary-button mt-4">Ver todas</button>
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Páginas de oportunidades">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => goToPage(page - 1)}
                  className="pagination-button"
                  aria-label="Página anterior"
                >
                  <ChevronLeftIcon width={18} height={18} />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                  <button
                    key={number}
                    type="button"
                    aria-current={page === number ? "page" : undefined}
                    onClick={() => goToPage(number)}
                    className={`pagination-button ${page === number ? "pagination-button--active" : ""}`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => goToPage(page + 1)}
                  className="pagination-button"
                  aria-label="Página siguiente"
                >
                  <ChevronLeftIcon className="rotate-180" width={18} height={18} />
                </button>
              </nav>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
