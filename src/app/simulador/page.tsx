"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ArrowRightIcon, CheckCircleIcon, ChevronLeftIcon, ClockIcon, HelpCircleIcon, RouteIcon } from "@/components/icons";
import { opportunities } from "@/data/opportunities";
import { evaluateOpportunity, isPersonalizedOpportunityVisible, rankOpportunity, weightedAverage } from "@/lib/matching";
import { useProfile, useSession } from "@/lib/store";

const MATCH_TEXT = {
  recommended: "Coincide contigo",
  close: "Estás cerca",
  needs_data: "Completa un dato",
  special_condition: "Condición especial",
  official_validation: "Validación oficial",
  not_applicable: "No aplica ahora",
  general_catalog: "Información general",
} as const;

const CHECK_STYLE = {
  met: "bg-status-met-soft text-status-met",
  close: "bg-status-close-soft text-status-close",
  needs_info: "bg-status-info-soft text-status-info",
  official: "bg-status-pending-soft text-status-pending",
  unmet: "bg-status-unmet-soft text-status-unmet",
} as const;

export default function SimuladorPage() {
  return (
    <Suspense fallback={null}>
      <MiRutaContent />
    </Suspense>
  );
}

function MiRutaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();
  const oportunidadId = searchParams.get("oportunidad");

  const candidates = useMemo(
    () => opportunities
      .map((opportunity, index) => {
        const evaluation = evaluateOpportunity(opportunity, profile);
        return { opportunity, evaluation, index, ranking: rankOpportunity(opportunity, evaluation, profile) };
      })
      .filter(({ opportunity, evaluation }) => opportunity.actionability !== "informational" && isPersonalizedOpportunityVisible(evaluation, opportunity))
      .sort((a, b) => b.ranking.score - a.ranking.score || a.index - b.index),
    [profile]
  );

  const selected = candidates.find(({ opportunity }) => opportunity.id === oportunidadId) ?? null;
  const contextRequirement = selected?.opportunity.requirements.find(
    (requirement) => requirement.type === "numeric_gpa" && requirement.threshold !== undefined
  );

  const [tab, setTab] = useState<"curso" | "ciclo">("ciclo");
  const [targetGpa, setTargetGpa] = useState("15");
  const [courseCredits, setCourseCredits] = useState("4");

  useEffect(() => {
    if (contextRequirement?.threshold === undefined) return;
    const frame = window.requestAnimationFrame(() => setTargetGpa(String(contextRequirement.threshold)));
    return () => window.cancelAnimationFrame(frame);
  }, [contextRequirement]);

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/configurar");
    else if (!profile.academicSetupComplete) router.replace("/panel?setup=1");
    else if (!profile.profileRefined) router.replace("/personalizar");
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, profile.academicSetupComplete, profile.profileRefined, router]);

  const requiredGrade = useMemo(() => {
    const target = Number.parseFloat(targetGpa.replace(",", "."));
    const credits = Number.parseFloat(courseCredits.replace(",", "."));
    if (Number.isNaN(target) || Number.isNaN(credits) || credits <= 0 || profile.approvedCredits === null || profile.cumulativeGpa === null) return null;
    const totalCredits = profile.approvedCredits + credits;
    return (target * totalCredits - profile.cumulativeGpa * profile.approvedCredits) / credits;
  }, [targetGpa, courseCredits, profile.approvedCredits, profile.cumulativeGpa]);

  const cycleProjection = useMemo(() => {
    const confirmedCourses = profile.courses.filter((course) => course.name.trim() && course.grade !== null && course.credits > 0);
    if (confirmedCourses.length === 0 || profile.approvedCredits === null || profile.cumulativeGpa === null) return null;
    const cycleAvg = weightedAverage(confirmedCourses);
    if (cycleAvg === null) return null;
    const cycleCredits = confirmedCourses.reduce((sum, course) => sum + course.credits, 0);
    const totalCredits = profile.approvedCredits + cycleCredits;
    const projected = totalCredits === 0 ? 0 : (profile.cumulativeGpa * profile.approvedCredits + cycleAvg * cycleCredits) / totalCredits;
    return { cycleAvg, cycleCredits, projected: Math.round(projected * 100) / 100 };
  }, [profile.courses, profile.approvedCredits, profile.cumulativeGpa]);

  if (!profileHydrated || !profile.onboarded || !profile.academicSetupComplete || !profile.profileRefined) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-7 md:px-10 md:py-10">
        <header className="page-enter max-w-4xl">
          <p className="eyebrow">De oportunidad a acción</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-canvas-foreground md:text-4xl">Mi ruta</h1>
          <p className="mt-3 text-base leading-7 text-canvas-foreground/70">
            Elige una oportunidad concreta y MetaUTP convierte sus requisitos en una lista de próximos pasos. La proyección académica es una ayuda de planificación, no una aceptación oficial.
          </p>
        </header>

        {!selected ? (
          <section className="mt-7" aria-labelledby="route-goal-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="route-goal-title" className="text-xl font-bold">Elige tu meta</h2>
                <p className="mt-1 text-sm text-canvas-foreground/60">Estas son tus oportunidades activas mejor ordenadas.</p>
              </div>
              <Link href="/oportunidades" className="text-sm font-bold text-primary hover:underline">Ver catálogo completo</Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {candidates.slice(0, 6).map(({ opportunity, evaluation, ranking }) => (
                <Link key={opportunity.id} href={`/simulador?oportunidad=${opportunity.id}`} className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{opportunity.category}</span>
                    <span className="text-xs font-bold text-canvas-foreground/50">{MATCH_TEXT[evaluation.matchState]}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-canvas-foreground group-hover:text-primary">{opportunity.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-canvas-foreground/62">{ranking.reason}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">Crear mi ruta <ArrowRightIcon width={15} height={15} /></span>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-7 rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
            <Link href="/simulador" className="inline-flex items-center gap-1 text-sm font-bold text-canvas-foreground/55 hover:text-primary"><ChevronLeftIcon width={16} height={16} /> Cambiar de meta</Link>
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{selected.opportunity.category}</span>
                <h2 className="mt-3 text-2xl font-bold text-canvas-foreground">{selected.opportunity.title}</h2>
                <p className="mt-2 text-sm leading-6 text-canvas-foreground/65">{selected.opportunity.shortDescription}</p>
              </div>
              <span className="rounded-full bg-sidebar px-4 py-2 text-sm font-bold text-sidebar-foreground">{MATCH_TEXT[selected.evaluation.matchState]}</span>
            </div>

            <div className="mt-6 rounded-2xl bg-canvas-soft p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-canvas-foreground/45">Tu prioridad ahora</p>
              <p className="mt-2 text-base font-bold text-canvas-foreground">
                {selected.evaluation.primaryGap ?? "No detectamos un requisito pendiente con los datos actuales."}
              </p>
              <p className="mt-1 text-sm leading-6 text-canvas-foreground/60">{selected.evaluation.window.label}</p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {selected.evaluation.gateEvaluations.map(({ gate, result }) => (
                <div key={gate.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${result === "met" ? CHECK_STYLE.met : result === "unmet" ? CHECK_STYLE.unmet : CHECK_STYLE.needs_info}`}>
                    {result === "met" ? <CheckCircleIcon width={17} height={17} /> : result === "unmet" ? <ClockIcon width={17} height={17} /> : <HelpCircleIcon width={17} height={17} />}
                  </span>
                  <div><p className="text-sm font-bold leading-5">{gate.label}</p><p className="mt-1 text-xs text-canvas-foreground/55">{result === "met" ? "Confirmado con tu perfil" : result === "unmet" ? "No coincide por ahora" : "Dato pendiente"}</p></div>
                </div>
              ))}
              {selected.evaluation.evaluations.map((item) => (
                <div key={item.requirement.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${CHECK_STYLE[item.status]}`}>
                    {item.status === "met" ? <CheckCircleIcon width={17} height={17} /> : item.status === "official" || item.status === "needs_info" ? <HelpCircleIcon width={17} height={17} /> : <ClockIcon width={17} height={17} />}
                  </span>
                  <div><p className="text-sm font-bold leading-5">{item.requirement.description}</p><p className="mt-1 text-xs leading-5 text-canvas-foreground/55">{item.detail}</p></div>
                </div>
              ))}
            </div>

            {selected.opportunity.actionNote && <div className="mt-6 rounded-2xl border border-primary/15 bg-primary-soft p-5"><p className="text-xs font-bold uppercase tracking-wide text-primary">Acción recomendada</p><p className="mt-2 text-sm leading-6 text-canvas-foreground/75">{selected.opportunity.actionNote}</p></div>}
            <Link href={`/oportunidades/${selected.opportunity.id}`} className="primary-button mt-5 w-full">Ver detalle y fuente oficial <ArrowRightIcon width={17} height={17} /></Link>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><RouteIcon width={20} height={20} /></span>
            <div><h2 className="text-xl font-bold">Simulador académico</h2><p className="mt-1 text-sm leading-6 text-canvas-foreground/60">Usa tus notas para proyectar escenarios. MetaUTP nunca usa esta estimación para inventar tu tercio, quinto o décimo superior.</p></div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => setTab("ciclo")} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === "ciclo" ? "bg-sidebar text-sidebar-foreground" : "border border-border bg-white text-canvas-foreground/70"}`}>Proyección de mi ciclo</button>
            <button type="button" onClick={() => setTab("curso")} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === "curso" ? "bg-sidebar text-sidebar-foreground" : "border border-border bg-white text-canvas-foreground/70"}`}>Meta de promedio acumulado</button>
          </div>

          {tab === "ciclo" ? (
            <div className="mt-5 rounded-2xl bg-canvas-soft p-5">
              {cycleProjection === null ? (
                <p className="text-sm leading-6 text-canvas-foreground/60">Registra cursos con créditos y notas en <Link href="/panel" className="font-bold text-primary hover:underline">Cursos y documentos</Link> para calcular la proyección.</p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-3">
                  <div><p className="text-xs font-bold uppercase text-canvas-foreground/45">Promedio del ciclo</p><p className="mt-1 text-2xl font-bold">{cycleProjection.cycleAvg}</p></div>
                  <div><p className="text-xs font-bold uppercase text-canvas-foreground/45">Créditos del ciclo</p><p className="mt-1 text-2xl font-bold">{cycleProjection.cycleCredits}</p></div>
                  <div><p className="text-xs font-bold uppercase text-canvas-foreground/45">Acumulado proyectado</p><p className="mt-1 text-2xl font-bold text-primary">{cycleProjection.projected}</p></div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label><span className="field-label">Promedio acumulado que quiero alcanzar</span><input type="text" inputMode="decimal" value={targetGpa} onChange={(event) => setTargetGpa(event.target.value)} className="field-control" /></label>
              <label><span className="field-label">Créditos hipotéticos adicionales</span><input type="text" inputMode="decimal" value={courseCredits} onChange={(event) => setCourseCredits(event.target.value)} className="field-control" /></label>
              <div className="rounded-2xl bg-canvas-soft p-5 md:col-span-2">
                {requiredGrade === null ? <p className="text-sm text-canvas-foreground/60">Necesitas un promedio acumulado y créditos aprobados confirmados para calcular.</p> : requiredGrade > 20 ? <p className="text-sm font-bold text-status-unmet">No es posible alcanzar {targetGpa} en solo {courseCredits} créditos: la nota requerida sería mayor a 20.</p> : requiredGrade <= 0 ? <p className="text-sm font-bold text-status-met">Ya superarías esa meta con los datos registrados.</p> : <p className="text-sm font-bold">Necesitarías un promedio aproximado de <span className="text-xl text-primary">{requiredGrade.toFixed(1)}</span> en esos {courseCredits} créditos.</p>}
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
