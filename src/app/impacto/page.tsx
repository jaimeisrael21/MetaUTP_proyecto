"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AlertIcon, BuildingIcon } from "@/components/icons";
import { opportunities } from "@/data/opportunities";
import { evaluateOpportunity } from "@/lib/matching";
import { useProfile, useSession } from "@/lib/store";

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
    const evaluations = opportunities.map((opportunity) =>
      evaluateOpportunity(opportunity, profile)
    );
    return {
      ready: evaluations.filter(
        (evaluation) =>
          evaluation.unmetCount === 0 &&
          evaluation.closeCount === 0 &&
          evaluation.needsInfoCount === 0
      ).length,
      close: evaluations.filter((evaluation) => evaluation.closeCount > 0).length,
      total: opportunities.length,
    };
  }, [profile]);

  if (!profileHydrated || !profile.onboarded) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-5 py-7 md:px-10 md:py-9">
        <p className="text-sm font-semibold text-primary">Valor institucional</p>
        <h1 className="mt-1 text-2xl font-bold text-canvas-foreground md:text-3xl">
          Una mejor experiencia para el estudiante también genera mejores decisiones.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-canvas-foreground/65">
          MetaUTP organiza información dispersa, muestra brechas concretas y orienta la
          siguiente acción. Si una institución adopta la plataforma, podría recibir
          indicadores agregados y anonimizados sin exponer el historial individual.
        </p>

        <section className="mt-6 rounded-2xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-canvas-foreground/50">
            Resultado calculado con tu perfil
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-status-met">{personal.ready}</p>
              <p className="text-xs text-canvas-foreground/60">sin bloqueos detectados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-status-close">{personal.close}</p>
              <p className="text-xs text-canvas-foreground/60">cercanas por un requisito</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-canvas-foreground">{personal.total}</p>
              <p className="text-xs text-canvas-foreground/60">oportunidades mapeadas</p>
            </div>
          </div>
        </section>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-status-pending-soft px-4 py-3 text-status-pending">
          <AlertIcon width={16} height={16} className="mt-0.5 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">
            Este prototipo todavía no genera estadísticas institucionales. Cualquier panel
            agregado requerirá consentimiento, reglas de privacidad y datos reales antes de
            presentar porcentajes o resultados como evidencia.
          </p>
        </div>

        <section className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            [String(opportunities.length), "oportunidades documentadas en el catálogo actual"],
            ["S/ 0", "costo directo propuesto para el estudiante"],
            ["4 áreas", "para explorar por interés sin perder la vista de todas"],
          ].map(([value, description]) => (
            <div key={value} className="rounded-2xl border border-dashed border-border-strong bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <BuildingIcon width={18} height={18} />
              </span>
              <p className="mt-3 text-2xl font-bold text-canvas-foreground">{value}</p>
              <p className="mt-1 text-sm leading-relaxed text-canvas-foreground/60">{description}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl bg-sidebar p-6 text-sidebar-foreground">
          <p className="text-sm font-semibold text-primary">Propuesta de valor</p>
          <p className="mt-2 text-sm leading-relaxed text-sidebar-muted">
            Para el estudiante: menos búsqueda, más claridad y un siguiente paso concreto.
            Para la institución: la posibilidad de detectar oportunidades poco visibles y
            requisitos que frenan a muchos alumnos, siempre con información agregada y
            políticas explícitas de privacidad.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
