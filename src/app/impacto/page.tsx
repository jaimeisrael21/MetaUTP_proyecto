"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useProfile, useSession } from "@/lib/store";
import { opportunities } from "@/data/opportunities";
import { evaluateOpportunity } from "@/lib/matching";
import { AlertIcon, BuildingIcon } from "@/components/icons";

export default function ImpactoPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/bienvenida");
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, router]);

  const personal = useMemo(() => {
    const evals = opportunities.map((o) => evaluateOpportunity(o, profile));
    const met = evals.filter((e) => e.dominantStatus === "met").length;
    const close = evals.filter((e) => e.dominantStatus === "close").length;
    return { met, close, total: opportunities.length };
  }, [profile]);

  if (!profileHydrated || !profile.onboarded) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-8 md:px-10">
        <p className="text-sm font-semibold text-primary">Impacto institucional</p>
        <h1 className="mt-1 text-2xl font-bold text-canvas-foreground md:text-3xl">
          Lo que MetaUTP le mostraría a Bienestar Universitario
        </h1>
        <p className="mt-2 max-w-xl text-sm text-canvas-foreground/60">
          Con adopción institucional, MetaUTP puede agregar (de forma anónima) cuántos
          estudiantes están cerca de una oportunidad que no conocen — información que hoy
          la universidad no tiene forma de ver.
        </p>

        <section className="mt-6 rounded-2xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-canvas-foreground/50">
            Tu impacto real, hoy
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-status-met">{personal.met}</p>
              <p className="text-xs text-canvas-foreground/60">oportunidades que ya cumples</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-status-close">{personal.close}</p>
              <p className="text-xs text-canvas-foreground/60">a las que estás cerca</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-canvas-foreground">{personal.total}</p>
              <p className="text-xs text-canvas-foreground/60">oportunidades reales mapeadas</p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex items-start gap-2 rounded-xl bg-status-pending-soft px-4 py-3 text-status-pending">
          <AlertIcon width={16} height={16} className="mt-0.5 shrink-0" />
          <p className="text-xs font-medium">
            Todo lo que sigue es una vista conceptual con cifras ilustrativas para explicar
            la propuesta a la universidad — no son estadísticas oficiales ni datos medidos de
            la UTP. Se activarían con datos reales y anonimizados una vez que la institución
            adopte la plataforma.
          </p>
        </div>

        <section className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-border-strong bg-white p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <BuildingIcon width={18} height={18} />
            </span>
            <p className="mt-3 text-2xl font-bold text-canvas-foreground">62%</p>
            <p className="mt-1 text-sm text-canvas-foreground/60">
              de una facultad tipo estaría a un paso de una beca o convenio que no conoce
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-border-strong bg-white p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <BuildingIcon width={18} height={18} />
            </span>
            <p className="mt-3 text-2xl font-bold text-canvas-foreground">S/ 0</p>
            <p className="mt-1 text-sm text-canvas-foreground/60">
              costo directo para el estudiante — la universidad licencia la plataforma, no el
              alumno
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-border-strong bg-white p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <BuildingIcon width={18} height={18} />
            </span>
            <p className="mt-3 text-2xl font-bold text-canvas-foreground">4</p>
            <p className="mt-1 text-sm text-canvas-foreground/60">
              categorías de oportunidades institucionales cruzadas automáticamente
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-sidebar p-6 text-sidebar-foreground">
          <p className="text-sm font-semibold text-primary">Por qué le sirve a la UTP</p>
          <p className="mt-2 text-sm text-sidebar-muted">
            Hoy la universidad publica becas, intercambios y convenios, pero no tiene
            visibilidad de cuántos estudiantes realmente los alcanzan o por qué los
            pierden. MetaUTP convierte esa brecha en datos agregados y anónimos: qué
            porcentaje de una facultad está cerca de calificar, qué requisito es el
            cuello de botella más común, y qué oportunidades tienen baja postulación
            pese a tener alta demanda potencial.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
