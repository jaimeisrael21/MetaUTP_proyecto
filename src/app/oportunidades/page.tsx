"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { GoalGuide } from "@/components/GoalGuide";
import { ChevronLeftIcon, CompassIcon, HelpCircleIcon } from "@/components/icons";
import { OpportunityCard } from "@/components/OpportunityCard";
import { CURRENT_ACADEMIC_PERIOD } from "@/data/academic-period";
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
const PAGE_SIZE = 4;

export default function OportunidadesPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, update, hydrated: profileHydrated } = useProfile();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Todas");
  const [page, setPage] = useState(1);
  const [aiPriorityIds, setAiPriorityIds] = useState<string[]>([]);

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
          ranking: rankOpportunity(opportunity, evaluation, profile),
        };
      }),
    [profile]
  );

  const orderedOpportunities = useMemo(() => {
    const aiOrder = new Map(aiPriorityIds.map((id, index) => [id, index]));
    const aiBoost = (id: string, state: (typeof evaluatedAll)[number]["evaluation"]["matchState"]) => {
      if (state === "not_applicable" || state === "general_catalog" || state === "special_condition") return 0;
      const index = aiOrder.get(id);
      return index === undefined ? 0 : Math.max(4, 34 - index * 3);
    };

    return evaluatedAll
      .filter(({ opportunity }) => category === "Todas" || opportunity.category === category)
      .sort((first, second) => {
        const firstScore = first.ranking.score + aiBoost(first.opportunity.id, first.evaluation.matchState);
        const secondScore = second.ranking.score + aiBoost(second.opportunity.id, second.evaluation.matchState);
        return secondScore - firstScore || first.catalogIndex - second.catalogIndex;
      });
  }, [category, evaluatedAll, aiPriorityIds]);

  const totalPages = Math.max(1, Math.ceil(orderedOpportunities.length / PAGE_SIZE));
  const pageItems = orderedOpportunities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(
    () => ({
      recommended: evaluatedAll.filter(({ evaluation }) => evaluation.matchState === "recommended").length,
      close: evaluatedAll.filter(({ evaluation }) => evaluation.matchState === "close").length,
      needsData: evaluatedAll.filter(({ evaluation }) => evaluation.matchState === "needs_data" || evaluation.matchState === "special_condition").length,
      official: evaluatedAll.filter(({ evaluation }) => evaluation.matchState === "official_validation").length,
    }),
    [evaluatedAll]
  );

  function chooseCategory(next: (typeof CATEGORIES)[number]) {
    setCategory(next);
    setPage(1);
  }

  if (!profileHydrated || !profile.onboarded || !profile.academicSetupComplete) return null;

  const firstName = (profile.name || session.name || "Estudiante").split(" ")[0];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] px-5 py-6 md:px-8 xl:px-10">
        <header className="page-enter flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-canvas-foreground md:text-4xl">
              Oportunidades para {firstName}
            </h1>
            <p className="mt-2 text-sm font-medium text-canvas-foreground/62">
              Basadas en tu perfil académico · <Link href="/configurar" className="font-bold text-primary hover:underline">Editar datos</Link>
            </p>
          </div>
          <span
            className="academic-period"
            title={`Verificado el ${CURRENT_ACADEMIC_PERIOD.verifiedAt}. ${CURRENT_ACADEMIC_PERIOD.source}`}
          >
            <span aria-hidden="true" className="academic-period__dot" />
            {CURRENT_ACADEMIC_PERIOD.label} · Semana {CURRENT_ACADEMIC_PERIOD.week}
          </span>
        </header>

        <div className="mt-5 page-enter">
          <GoalGuide
            profile={profile}
            onUpdateProfile={update}
            onPriorities={(ids) => {
              setAiPriorityIds(ids);
              setPage(1);
            }}
          />
        </div>

        <section className="catalog-summary mt-5" aria-label="Resumen de coincidencias">
          <span><strong className="text-status-met">{summary.recommended}</strong> coinciden</span>
          <span><strong className="text-status-close">{summary.close}</strong> cercanas</span>
          <span><strong className="text-status-info">{summary.needsData}</strong> requieren datos</span>
          <span><strong className="text-status-pending">{summary.official}</strong> validación oficial</span>
          <span className="group relative ml-auto">
            <button type="button" className="ranking-help" aria-describedby="ranking-tooltip">
              <HelpCircleIcon width={16} height={16} /> ¿Cómo ordenamos esto?
            </button>
            <span id="ranking-tooltip" role="tooltip" className="ranking-tooltip">
              Primero descartamos incompatibilidades esenciales; después ordenamos por requisitos académicos, datos pendientes, vigencia, urgencia y tu meta. Nunca usamos la IA para aprobar una beca.
            </span>
          </span>
        </section>

        <section className="mt-5" aria-labelledby="catalog-title">
          <div className="catalog-toolbar">
            <div>
              <h2 id="catalog-title" className="text-lg font-bold text-canvas-foreground">
                {category === "Todas" ? "Todas las oportunidades" : category}
              </h2>
              <p className="mt-1 text-sm text-canvas-foreground/58">Página {page} de {totalPages}</p>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
              {CATEGORIES.map((item) => (
                <button key={item} type="button" aria-pressed={category === item} onClick={() => chooseCategory(item)} className={`filter-pill ${category === item ? "filter-pill--active" : ""}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="opportunity-grid mt-4" aria-live="polite">
            {pageItems.map(({ opportunity, evaluation, ranking }, index) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                evaluation={evaluation}
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
            <nav className="catalog-pagination" aria-label="Páginas de oportunidades">
              <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="pagination-button" aria-label="Página anterior">
                <ChevronLeftIcon width={18} height={18} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                <button key={number} type="button" aria-current={page === number ? "page" : undefined} onClick={() => setPage(number)} className={`pagination-button ${page === number ? "pagination-button--active" : ""}`}>
                  {number}
                </button>
              ))}
              <button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="pagination-button" aria-label="Página siguiente">
                <ChevronLeftIcon className="rotate-180" width={18} height={18} />
              </button>
            </nav>
          )}
        </section>
      </div>
    </AppShell>
  );
}
