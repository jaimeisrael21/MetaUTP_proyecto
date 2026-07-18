"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { OpportunityCard } from "@/components/OpportunityCard";
import { opportunities } from "@/data/opportunities";
import type { OpportunityCategory } from "@/data/types";
import { evaluateOpportunity } from "@/lib/matching";
import { useProfile, useSession } from "@/lib/store";

const CATEGORIES: (OpportunityCategory | "Todas")[] = [
  "Todas",
  "Becas",
  "Intercambios",
  "Empleabilidad",
  "Convenios",
];

const STATUS_RANK: Record<string, number> = { met: 0, close: 1, pending: 2, unmet: 3 };

export default function OportunidadesPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Todas");

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/bienvenida");
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, router]);

  const evaluated = useMemo(() => {
    return opportunities
      .map((opp) => ({ opp, evaluation: evaluateOpportunity(opp, profile) }))
      .filter(({ opp }) => category === "Todas" || opp.category === category)
      .sort((a, b) => {
        const rankDiff = STATUS_RANK[a.evaluation.dominantStatus] - STATUS_RANK[b.evaluation.dominantStatus];
        if (rankDiff !== 0) return rankDiff;
        return b.evaluation.percent - a.evaluation.percent;
      });
  }, [category, profile]);

  const metCount = useMemo(
    () => opportunities.filter((o) => evaluateOpportunity(o, profile).dominantStatus === "met").length,
    [profile]
  );

  if (!profileHydrated || !profile.onboarded) return null;

  return (
    <AppShell>
      <div className="px-6 py-8 md:px-10">
        <p className="text-sm font-semibold text-primary">Oportunidades</p>
        <h1 className="mt-1 text-2xl font-bold text-canvas-foreground md:text-3xl">
          Ya cumples {metCount} de {opportunities.length} oportunidades disponibles
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-canvas-foreground/60">
          Con tu ciclo {profile.cycle}, promedio {profile.cumulativeGpa} y{" "}
          {profile.approvedCredits} créditos aprobados. MetaUTP no confirma postulaciones
          oficiales: te muestra qué requisitos cumples con tus datos y cuáles debes
          verificar en documentos de la universidad.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "bg-sidebar text-sidebar-foreground"
                  : "bg-white text-canvas-foreground/70 border border-border hover:border-border-strong"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {evaluated.map(({ opp, evaluation }) => (
            <OpportunityCard key={opp.id} opportunity={opp} evaluation={evaluation} />
          ))}
        </div>

        {evaluated.length === 0 && (
          <p className="mt-10 text-sm text-canvas-foreground/50">
            No hay oportunidades en esta categoría todavía.
          </p>
        )}
      </div>
    </AppShell>
  );
}
