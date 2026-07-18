"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { opportunities } from "@/data/opportunities";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useProfile, useSession } from "@/lib/store";
import { ArrowRightIcon } from "@/components/icons";

export default function BienvenidaPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();
  const featured = opportunities.filter((o) => o.featured);

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) {
      router.replace("/");
      return;
    }
    if (profile.onboarded) {
      router.replace("/oportunidades");
    }
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, router]);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center gap-2 px-6 py-6 md:px-12">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          M
        </span>
        <span className="text-lg font-bold tracking-tight text-canvas-foreground">MetaUTP</span>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-6 md:px-12">
        <p className="text-sm font-semibold text-primary">
          Hola{session.name ? `, ${session.name}` : ""} 👋
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight text-canvas-foreground md:text-4xl">
          Estas son 3 oportunidades reales de la UTP ahora mismo. Solo te falta saber si
          ya las alcanzas.
        </h1>
        <p className="mt-3 max-w-xl text-canvas-foreground/70">
          Configura tu ciclo con tu promedio ponderado y tus créditos aprobados —toma
          menos de un minuto— y desbloquea tu avance real en cada una.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} locked />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl border border-border bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-canvas-foreground">
              Desbloquea tu panel de oportunidades
            </p>
            <p className="mt-1 text-sm text-canvas-foreground/60">
              Ciclo actual, promedio ponderado y créditos aprobados. Nada más.
            </p>
          </div>
          <Link
            href="/configurar"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Configurar mi ciclo
            <ArrowRightIcon width={16} height={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
