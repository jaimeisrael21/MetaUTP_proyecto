"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useProfile, useSession } from "@/lib/store";
import { weightedAverage } from "@/lib/matching";
import { opportunities } from "@/data/opportunities";
import { ChevronLeftIcon } from "@/components/icons";

export default function SimuladorPage() {
  return (
    <Suspense fallback={null}>
      <SimuladorContent />
    </Suspense>
  );
}

function SimuladorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();

  const oportunidadId = searchParams.get("oportunidad");
  const contextOpportunity = opportunities.find((o) => o.id === oportunidadId);
  const contextRequirement = contextOpportunity?.requirements.find(
    (r) => r.type === "numeric_gpa" && r.threshold !== undefined
  );

  const [tab, setTab] = useState<"curso" | "ciclo">("curso");
  const [targetGpa, setTargetGpa] = useState("15");
  const [courseCredits, setCourseCredits] = useState("4");

  useEffect(() => {
    if (contextRequirement?.threshold !== undefined) {
      const frame = window.requestAnimationFrame(() => {
        setTargetGpa(String(contextRequirement.threshold));
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [contextRequirement]);

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/bienvenida");
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, router]);

  const requiredGrade = useMemo(() => {
    const target = parseFloat(targetGpa.replace(",", "."));
    const credits = parseFloat(courseCredits.replace(",", "."));
    if (Number.isNaN(target) || Number.isNaN(credits) || credits <= 0) return null;
    const totalCredits = profile.approvedCredits + credits;
    const grade = (target * totalCredits - profile.cumulativeGpa * profile.approvedCredits) / credits;
    return grade;
  }, [targetGpa, courseCredits, profile.approvedCredits, profile.cumulativeGpa]);

  const cycleProjection = useMemo(() => {
    const namedCourses = profile.courses.filter((c) => c.name.trim());
    if (namedCourses.length === 0) return null;
    const cycleAvg = weightedAverage(namedCourses);
    const cycleCredits = namedCourses.reduce((s, c) => s + c.credits, 0);
    const totalCredits = profile.approvedCredits + cycleCredits;
    const projected =
      totalCredits === 0
        ? 0
        : (profile.cumulativeGpa * profile.approvedCredits + cycleAvg * cycleCredits) / totalCredits;
    return { cycleAvg, cycleCredits, projected: Math.round(projected * 100) / 100 };
  }, [profile.courses, profile.approvedCredits, profile.cumulativeGpa]);

  if (!profileHydrated || !profile.onboarded) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-6 py-8 md:px-10">
        {contextOpportunity ? (
          <Link
            href={`/oportunidades/${contextOpportunity.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-canvas-foreground/60 hover:text-canvas-foreground"
          >
            <ChevronLeftIcon width={16} height={16} />
            Volver a {contextOpportunity.title}
          </Link>
        ) : null}

        <p className="mt-4 text-sm font-semibold text-primary">Simulador</p>
        <h1 className="mt-1 text-2xl font-bold text-canvas-foreground md:text-3xl">
          {contextOpportunity
            ? `¿Qué necesitas para "${contextOpportunity.title}"?`
            : "Simula tu promedio ponderado"}
        </h1>
        <p className="mt-2 text-sm text-canvas-foreground/60">
          Cálculo con tu promedio actual ({profile.cumulativeGpa}) y tus {profile.approvedCredits}{" "}
          créditos aprobados. Es una proyección tuya, no una nota oficial.
        </p>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("curso")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === "curso" ? "bg-sidebar text-sidebar-foreground" : "bg-white text-canvas-foreground/70 border border-border"
            }`}
          >
            Un curso hipotético
          </button>
          <button
            type="button"
            onClick={() => setTab("ciclo")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === "ciclo" ? "bg-sidebar text-sidebar-foreground" : "bg-white text-canvas-foreground/70 border border-border"
            }`}
          >
            Proyección de mi ciclo actual
          </button>
        </div>

        {tab === "curso" ? (
          <div className="mt-6 space-y-5 rounded-2xl border border-border bg-white p-6">
            <div>
              <label className="text-sm font-medium text-canvas-foreground">
                Promedio ponderado que quiero alcanzar
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={targetGpa}
                onChange={(e) => setTargetGpa(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-canvas-foreground">
                Créditos del curso que rendirás
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={courseCredits}
                onChange={(e) => setCourseCredits(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="rounded-xl bg-canvas-soft p-4">
              {requiredGrade === null ? (
                <p className="text-sm text-canvas-foreground/60">
                  Completa los dos campos para calcular.
                </p>
              ) : requiredGrade > 20 ? (
                <p className="text-sm font-medium text-status-unmet">
                  No es posible llegar a {targetGpa} con un solo curso de {courseCredits} créditos
                  — necesitarías una nota mayor a 20. Prueba distribuyendo la meta entre más
                  cursos en la Proyección del ciclo.
                </p>
              ) : requiredGrade <= 0 ? (
                <p className="text-sm font-medium text-status-met">
                  Ya superarías {targetGpa} sin importar la nota de este curso.
                </p>
              ) : (
                <p className="text-sm font-medium text-canvas-foreground">
                  Necesitas al menos{" "}
                  <span className="text-lg font-bold text-primary">
                    {Math.max(0, requiredGrade).toFixed(1)}
                  </span>{" "}
                  en ese curso de {courseCredits} créditos para llegar a {targetGpa}.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-5 rounded-2xl border border-border bg-white p-6">
            {cycleProjection === null ? (
              <p className="text-sm text-canvas-foreground/60">
                Aún no registraste cursos en{" "}
                <Link href="/panel" className="font-semibold text-primary hover:underline">
                  Panel del ciclo
                </Link>
                . Agrega tus cursos y notas ahí para ver la proyección aquí.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-canvas-foreground/50">
                      Promedio de este ciclo
                    </p>
                    <p className="mt-1 text-2xl font-bold text-canvas-foreground">
                      {cycleProjection.cycleAvg}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-canvas-foreground/50">
                      Promedio acumulado proyectado
                    </p>
                    <p className="mt-1 text-2xl font-bold text-primary">
                      {cycleProjection.projected}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-canvas-foreground/60">
                  Si terminas el ciclo con esas notas, tu promedio ponderado acumulado
                  pasaría de {profile.cumulativeGpa} a {cycleProjection.projected}.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
