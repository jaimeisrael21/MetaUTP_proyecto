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
  SearchIcon,
} from "@/components/icons";
import { OpportunityCard } from "@/components/OpportunityCard";
import { CertificationOpportunityCard } from "@/components/CertificationOpportunityCard";
import { CatalogPeriodNotice } from "@/components/CatalogPeriodNotice";
import { CURRENT_ACADEMIC_PERIOD } from "@/data/academic-period";
import { certificationPaths, type CertificationPath } from "@/data/certifications";
import { opportunities } from "@/data/opportunities";
import type { OpportunityCategory } from "@/data/types";
import {
  evaluateCertification,
  isCertificationRelevant,
  rankCertification,
  type CertificationEvaluation,
} from "@/lib/certification-matching";
import {
  evaluateOpportunity,
  isPersonalizedOpportunityVisible,
  isRelevantClosedOpportunity,
  rankOpportunity,
} from "@/lib/matching";
import { useProfile, useSession } from "@/lib/store";

type CatalogCategory = OpportunityCategory | "Todas" | "Certificaciones";

type CatalogItem =
  | {
      kind: "opportunity";
      opportunity: (typeof opportunities)[number];
      evaluation: ReturnType<typeof evaluateOpportunity>;
      ranking: ReturnType<typeof rankOpportunity>;
      catalogIndex: number;
      score: number;
    }
  | {
      kind: "certification";
      path: CertificationPath;
      evaluation: CertificationEvaluation;
      catalogIndex: number;
      score: number;
    };

const CATEGORIES: CatalogCategory[] = [
  "Todas",
  "Becas",
  "Intercambios",
  "Empleabilidad",
  "Convenios",
  "Certificaciones",
];
const PAGE_SIZE = 4;

function normalizedSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesSearch(values: Array<string | undefined>, query: string) {
  if (!query) return true;
  return normalizedSearch(values.filter(Boolean).join(" ")).includes(query);
}

export default function OportunidadesPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Todas");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = normalizedSearch(searchQuery);

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
    () => evaluatedAll.filter(({ opportunity, evaluation }) => isPersonalizedOpportunityVisible(evaluation, opportunity)),
    [evaluatedAll]
  );

  const closedReferences = useMemo(() => {
    if (category === "Todas" || category === "Certificaciones") return [];
    return evaluatedAll
      .filter(
        ({ opportunity, evaluation }) =>
          opportunity.category === category &&
          isRelevantClosedOpportunity(evaluation) &&
          includesSearch(
            [opportunity.title, opportunity.shortDescription, opportunity.category],
            normalizedQuery
          )
      )
      .sort((first, second) =>
        (second.opportunity.windowEnd ?? "").localeCompare(first.opportunity.windowEnd ?? "")
      )
      .slice(0, 4);
  }, [category, evaluatedAll, normalizedQuery]);

  const personalizedCertifications = useMemo(
    () =>
      certificationPaths
        .filter((path) => isCertificationRelevant(path, profile))
        .map((path) => ({ path, evaluation: evaluateCertification(path, profile) })),
    [profile]
  );

  const orderedCatalog = useMemo(() => {
    const opportunityItems: CatalogItem[] = category === "Certificaciones"
      ? []
      : personalized
          .filter(
            ({ opportunity }) =>
              (category === "Todas" || opportunity.category === category) &&
              includesSearch(
                [
                  opportunity.title,
                  opportunity.shortDescription,
                  opportunity.category,
                ],
                normalizedQuery
              )
          )
          .map((item) => ({
            kind: "opportunity" as const,
            ...item,
            score: item.ranking.score,
          }));
    const certificationItems: CatalogItem[] = category === "Todas" || category === "Certificaciones"
      ? personalizedCertifications
          .filter(({ path }) =>
            includesSearch(
              [path.title, path.summary, path.issuer, path.whatItIs],
              normalizedQuery
            )
          )
          .map(({ path, evaluation }, index) => ({
            kind: "certification" as const,
            path,
            evaluation,
            catalogIndex: opportunities.length + index,
            score: rankCertification(path, evaluation, profile),
          }))
      : [];
    return [...opportunityItems, ...certificationItems].sort(
      (first, second) => second.score - first.score || first.catalogIndex - second.catalogIndex
    );
  }, [category, normalizedQuery, personalized, personalizedCertifications, profile]);

  const totalPages = Math.max(1, Math.ceil(orderedCatalog.length / PAGE_SIZE));
  const pageItems = orderedCatalog.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(
    () => ({
      recommended:
        personalized.filter(({ evaluation }) => evaluation.matchState === "recommended").length +
        personalizedCertifications.filter(({ evaluation }) => evaluation.matchState === "recommended").length,
      close:
        personalized.filter(({ evaluation }) => evaluation.matchState === "close").length +
        personalizedCertifications.filter(({ evaluation }) => evaluation.matchState === "close").length,
      needsData:
        personalized.filter(({ evaluation }) => evaluation.matchState === "needs_data").length +
        personalizedCertifications.filter(({ evaluation }) => evaluation.matchState === "needs_data").length,
      official:
        personalized.filter(({ evaluation }) => evaluation.matchState === "official_validation").length +
        personalizedCertifications.filter(({ evaluation }) => evaluation.matchState === "official_validation").length,
    }),
    [personalized, personalizedCertifications]
  );

  function chooseCategory(next: CatalogCategory) {
    setCategory(next);
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearchQuery(value);
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

          <label className="relative mt-4 block max-w-xl" htmlFor="opportunity-search">
            <span className="sr-only">Buscar oportunidades</span>
            <SearchIcon
              width={18}
              height={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-canvas-foreground/42"
            />
            <input
              id="opportunity-search"
              type="search"
              value={searchQuery}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Buscar por nombre, entidad o tema"
              className="field-control mt-0 pl-11"
            />
          </label>

          <div className="opportunity-grid mt-4" aria-live="polite">
            {pageItems.map((item, index) => item.kind === "opportunity" ? (
              <OpportunityCard
                key={item.opportunity.id}
                opportunity={item.opportunity}
                evaluation={item.evaluation}
                rankingReason={item.ranking.reason}
                animationIndex={index}
              />
            ) : (
              <CertificationOpportunityCard
                key={item.path.id}
                path={item.path}
                evaluation={item.evaluation}
                animationIndex={index}
              />
            ))}
          </div>

          {pageItems.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-border-strong bg-white p-8 text-center">
              <CompassIcon className="mx-auto text-primary" width={28} height={28} />
              <p className="mt-3 text-base font-bold text-canvas-foreground">
                No hay oportunidades abiertas en esta categoría que coincidan con tus datos.
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-canvas-foreground/60">
                {closedReferences.length > 0
                  ? "Las oportunidades cerradas recientemente aparecen debajo como referencia para que puedas anticiparte a una próxima edición."
                  : "Esto puede deberse a la vigencia de las convocatorias o a condiciones específicas del perfil; no significa que la categoría esté dañada."}
              </p>
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

          {closedReferences.length > 0 && (
            <section className="mt-9 border-t border-border pt-8" aria-labelledby="closed-reference-title">
              <div>
                <p className="eyebrow">Para anticiparte</p>
                <h3 id="closed-reference-title" className="mt-1 text-xl font-bold text-canvas-foreground">
                  Convocatorias relacionadas contigo que cerraron recientemente
                </h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-canvas-foreground/60">
                  Solo aparecen cuando tus datos confirman la condición personal asociada. No están disponibles para postular hoy y una nueva edición debe verificarse en la fuente oficial.
                </p>
              </div>
              <div className="opportunity-grid mt-4">
                {closedReferences.map(({ opportunity, evaluation, ranking }, index) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    evaluation={evaluation}
                    rankingReason={ranking.reason}
                    animationIndex={index}
                  />
                ))}
              </div>
            </section>
          )}
        </section>
      </div>
    </AppShell>
  );
}
