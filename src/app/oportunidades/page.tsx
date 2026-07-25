"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ClockIcon,
  CompassIcon,
  HelpCircleIcon,
  PencilIcon,
} from "@/components/icons";
import { OpportunityCard } from "@/components/OpportunityCard";
import { CatalogPeriodNotice } from "@/components/CatalogPeriodNotice";
import { CURRENT_ACADEMIC_PERIOD } from "@/data/academic-period";
import { opportunities } from "@/data/opportunities";
import type { OpportunityCategory } from "@/data/types";
import { evaluateOpportunity, isPersonalizedOpportunityVisible, rankOpportunity } from "@/lib/matching";
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
  const { profile, hydrated: profileHydrated } = useProfile();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Todas");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/configurar");
    else if (!profile.academicSetupComplete) router.replace("/panel?setup=1");
    else if (!profile.profileRefined) router.replace("/personalizar");
  }, [
    sessionHydrated,
    profileHydrated,
    session.loggedIn,
    profile.onboarded,
    profile.academicSetupComplete,
    profile.profileRefined,
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

  const personalized = useMemo(
    () => evaluatedAll.filter(({ evaluation }) => isPersonalizedOpportunityVisible(evaluation)),
    [evaluatedAll]
  );

  const orderedOpportunities = useMemo(() => {
    return personalized
      .filter(({ opportunity }) => category === "Todas" || opportunity.category === category)
      .sort((first, second) => {
        return second.ranking.score - first.ranking.score || first.catalogIndex - second.catalogIndex;
      });
  }, [category, personalized]);

  const totalPages = Math.max(1, Math.ceil(orderedOpportunities.length / PAGE_SIZE));
  const pageItems = orderedOpportunities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(
    () => ({
      recommended: personalized.filter(({ evaluation }) => evaluation.matchState === "recommended").length,
      close: personalized.filter(({ evaluation }) => evaluation.matchState === "close").length,
      needsData: personalized.filter(({ evaluation }) => evaluation.matchState === "needs_data").length,
      official: personalized.filter(({ evaluation }) => evaluation.matchState === "official_validation").length,
    }),
    [personalized]
  );

  function chooseCategory(next: (typeof CATEGORIES)[number]) {
    setCategory(next);
    setPage(1);
  }

  if (!profileHydrated || !profile.onboarded || !profile.academicSetupComplete || !profile.profileRefined) return null;

  const displayName = (profile.name || session.name || "Estudiante").trim();

  return (
    <AppShell>
      <div className="mx-auto max-w-[1480px] px-5 py-6 md:px-8 xl:px-10">
        <header className="page-enter flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-canvas-foreground md:text-4xl">
              Oportunidades para {displayName}
            </h1>
            <p className="mt-2 text-sm font-medium text-canvas-foreground/62">
              Basadas en tu perfil académico · <Link href="/configuracion" className="font-bold text-primary hover:underline">Editar datos</Link>
            </p>
          </div>
          <span
            className="academic-period"
            title={`Verificado el ${CURRENT_ACADEMIC_PERIOD.verifiedAt}. ${CURRENT_ACADEMIC_PERIOD.source}`}
          >
            <span aria-hidden="true" className="academic-period__dot" />
            {CURRENT_ACADEMIC_PERIOD.label} · {CURRENT_ACADEMIC_PERIOD.stage}
          </span>
        </header>

        <div className="mt-5"><CatalogPeriodNotice compact /></div>

        <section className="summary-grid mt-6" aria-label="Resumen de oportunidades según tu perfil">
          <article className="metric-card metric-card--met">
            <span className="metric-card__icon" aria-hidden="true">
              <CheckCircleIcon width={27} height={27} strokeWidth={2.4} />
            </span>
            <div>
              <strong className="metric-card__value">{summary.recommended}</strong>
              <h2 className="metric-card__label">Coinciden contigo</h2>
              <p className="metric-card__help">Sin bloqueos detectados con tus datos.</p>
            </div>
          </article>

          <article className="metric-card metric-card--close">
            <span className="metric-card__icon" aria-hidden="true">
              <ClockIcon width={27} height={27} strokeWidth={2.4} />
            </span>
            <div>
              <strong className="metric-card__value">{summary.close}</strong>
              <h2 className="metric-card__label">Estás cerca</h2>
              <p className="metric-card__help">Te falta poco para un requisito medible.</p>
            </div>
          </article>

          <article className="metric-card metric-card--info">
            <span className="metric-card__icon" aria-hidden="true">
              <PencilIcon width={27} height={27} strokeWidth={2.4} />
            </span>
            <div>
              <strong className="metric-card__value">{summary.needsData}</strong>
              <h2 className="metric-card__label">Completa un dato</h2>
              <p className="metric-card__help">Podemos comparar mejor cuando lo registres.</p>
            </div>
          </article>

          <article className="metric-card metric-card--official">
            <span className="metric-card__icon" aria-hidden="true">
              <HelpCircleIcon width={27} height={27} strokeWidth={2.4} />
            </span>
            <div>
              <strong className="metric-card__value">{summary.official}</strong>
              <h2 className="metric-card__label">Falta por confirmar</h2>
              <p className="metric-card__help">La validación depende de la entidad responsable.</p>
            </div>
          </article>
        </section>

        <section className="mt-5" aria-labelledby="catalog-title">
          <div className="catalog-toolbar">
            <div>
              <h2 id="catalog-title" className="text-lg font-bold text-canvas-foreground">
                {category === "Todas" ? "Tus oportunidades" : category}
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
